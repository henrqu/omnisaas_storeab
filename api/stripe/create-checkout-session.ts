import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;
const getStripeInstance = (key: string): Stripe | null => {
  if (!stripeInstance && key) {
    try {
      stripeInstance = new Stripe(key, {
        apiVersion: "2023-10-16" as any,
      });
    } catch (err) {
      console.error("[Stripe Serverless] Error initializing Stripe:", err);
    }
  }
  return stripeInstance;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(455).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  console.log("Environment:", process.env.NODE_ENV);
  console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      success: false,
      error: "Missing STRIPE_SECRET_KEY environment variable."
    });
  }

  const stripe = getStripeInstance(secretKey);
  if (!stripe) {
    return res.status(500).json({
      success: false,
      error: "Failed to initialize Stripe with STRIPE_SECRET_KEY."
    });
  }

  const { lang } = req.body || {}; // 'pt' | 'es' | 'en'

  // Resolve pricing based on language detected/selected
  let currency = "USD";
  let unitAmount = 1999; // 19.99 in cents
  let priceId = process.env.STRIPE_PRICE_USD || "";
  let productName = "Life4Billion Premium Workspace License (English)";
  let productDesc = "Complete lifetime access to Life4Billion - Finances, Habits, Goals, and Copilot AI.";

  if (lang === "pt") {
    currency = "BRL";
    unitAmount = 9790; // 97.90 in cents
    priceId = process.env.STRIPE_PRICE_BRL || "";
    productName = "Licença do Espaço de Trabalho Premium Life4Billion";
    productDesc = "Acesso completo vitalício ao ecossistema Life4Billion - Finanças, Hábitos, Metas, Colaboradores e Copiloto de IA.";
  } else if (lang === "es") {
    currency = "EUR";
    unitAmount = 1999; // 19.99 in cents
    priceId = process.env.STRIPE_PRICE_EUR || "";
    productName = "Licencia del Espacio de Trabalho Premium Life4Billion";
    productDesc = "Acceso completo de por vida a Life4Billion: finanzas, hábitos, objetivos y Copiloto de IA.";
  }

  let hostUrl = process.env.APP_URL;
  if (!hostUrl) {
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers.host || "localhost:3000";
    hostUrl = `${protocol}://${host}`;
  }

  const successUrl = `${hostUrl}/?payment=success&lang=${lang || 'en'}`;
  const cancelUrl = `${hostUrl}/?payment=cancel&lang=${lang || 'en'}`;

  try {
    let mode = "payment";

    if (priceId) {
      try {
        const priceObj = await stripe.prices.retrieve(priceId);
        if (priceObj.type === "recurring" || priceObj.recurring) {
          mode = "subscription";
        }
      } catch (retrieveErr) {
        console.warn("[Stripe Serverless] Warning retrieving price, defaulting to 'payment':", retrieveErr);
      }
    }

    const createSessionWithMode = async (sessionMode: string) => {
      const sessionParam: any = {
        payment_method_types: ["card"],
        mode: sessionMode,
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      if (priceId) {
        sessionParam.line_items = [
          {
            price: priceId,
            quantity: 1,
          },
        ];
      } else {
        sessionParam.line_items = [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: productName,
                description: productDesc,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ];
      }
      return await stripe.checkout.sessions.create(sessionParam);
    };

    let session;
    try {
      session = await createSessionWithMode(mode);
    } catch (firstTryErr: any) {
      const errMsg = (firstTryErr.message || "").toLowerCase();
      if (errMsg.includes("recurring") || errMsg.includes("subscription") || errMsg.includes("payment")) {
        const fallbackMode = mode === "payment" ? "subscription" : "payment";
        console.log(`[Stripe Auto-Recovery] Mode '${mode}' failed. Retrying with mode '${fallbackMode}'...`);
        session = await createSessionWithMode(fallbackMode);
      } else {
        throw firstTryErr;
      }
    }

    return res.status(200).json({
      success: true,
      isConfigured: true,
      sessionId: session.id,
      checkoutUrl: session.url
    });

  } catch (err: any) {
    console.error("[Stripe Serverless Session Error]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erro ao gerar sessão de pagamento no Stripe."
    });
  }
}
