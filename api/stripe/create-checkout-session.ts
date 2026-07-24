import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getFounderSpots, decrementFounderSpots } from "../pricing/_spots";

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

  const { lang, planId } = req.body || {}; // lang: 'pt'|'es'|'en', planId: 'monthly'|'annual'|'founder'
  const targetPlan = planId || 'annual';

  // Check founder spots if founder plan requested
  const spotInfo = getFounderSpots();
  if (targetPlan === 'founder' && spotInfo.remaining <= 0) {
    return res.status(400).json({
      success: false,
      error: "O Plano Fundador está esgotado (0 de 30 vagas restantes)."
    });
  }

  // Resolve exact currency & unit amounts
  let currency = "USD";
  let unitAmount = 1999;
  let mode = "subscription";
  let recurringInterval: "month" | "year" | null = "month";
  let productName = "Life4Billion Plan";
  let productDesc = "Complete access to Life4Billion ERP, Finances, Habits, and AI Copilot.";

  if (targetPlan === "founder") {
    mode = "payment";
    recurringInterval = null;
    if (lang === "pt") {
      currency = "BRL";
      unitAmount = 49700; // R$ 497.00
      productName = "Plano Fundador Life4Billion — Acesso Vitalício";
      productDesc = "Oferta exclusiva de lançamento. Acesso vitalício sem mensalidades com garantia de 7 dias.";
    } else if (lang === "es") {
      currency = "EUR";
      unitAmount = 9900; // € 99.00
      productName = "Plan Fundador Life4Billion — Acceso De Por Vida";
      productDesc = "Oferta exclusiva de lanzamiento. Acceso de por vida sin cuotas mensuales con garantía de 7 días.";
    } else {
      currency = "USD";
      unitAmount = 9900; // $ 99.00
      productName = "Life4Billion Founder Plan — Lifetime Access";
      productDesc = "Exclusive launch offer. Lifetime access with zero monthly fees backed by a 7-day refund guarantee.";
    }
  } else if (targetPlan === "annual") {
    mode = "subscription";
    recurringInterval = "year";
    if (lang === "pt") {
      currency = "BRL";
      unitAmount = 59880; // R$ 598.80 / ano (R$ 49.90 / mês)
      productName = "Plano Anual Life4Billion (Mais Popular)";
      productDesc = "Economize 50% no plano anual. R$ 49,90/mês faturados anualmente (R$ 598,80/ano) com garantia de 7 dias.";
    } else if (lang === "es") {
      currency = "EUR";
      unitAmount = 11880; // € 118.80 / año (€ 9.90 / mes)
      productName = "Plan Anual Life4Billion (Más Popular)";
      productDesc = "Ahorra 50% en el plan anual. €9.90/mes facturados anualmente con garantía de 7 días.";
    } else {
      currency = "USD";
      unitAmount = 11988; // $ 119.88 / year ($ 9.99 / month)
      productName = "Life4Billion Annual Plan (Most Popular)";
      productDesc = "Save 50% with annual billing. $9.99/month billed annually ($119.88/yr) backed by a 7-day refund guarantee.";
    }
  } else {
    // Monthly plan
    mode = "subscription";
    recurringInterval = "month";
    if (lang === "pt") {
      currency = "BRL";
      unitAmount = 9790; // R$ 97.90 / mês
      productName = "Plano Mensal Life4Billion";
      productDesc = "Acesso flexível sem compromisso. Cancele quando quiser com garantia de reembolso de 7 dias.";
    } else if (lang === "es") {
      currency = "EUR";
      unitAmount = 1999; // € 19.99 / mês
      productName = "Plan Mensual Life4Billion";
      productDesc = "Acceso flexible sin compromiso. Cancela cuando quieras con garantía de reembolso de 7 días.";
    } else {
      currency = "USD";
      unitAmount = 1999; // $ 19.99 / month
      productName = "Life4Billion Monthly Plan";
      productDesc = "Flexible monthly access. Cancel anytime with a 100% 7-day money-back guarantee.";
    }
  }

  let hostUrl = process.env.APP_URL;
  if (!hostUrl) {
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.headers.host || (req.headers.origin ? String(req.headers.origin).replace(/^https?:\/\//, "") : "localhost:3000");
    hostUrl = `${protocol}://${host}`;
  }

  const successUrl = `${hostUrl}/?payment=success&lang=${lang || 'en'}&plan=${targetPlan}`;
  const cancelUrl = `${hostUrl}/?payment=cancel&lang=${lang || 'en'}`;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    let updatedSpot = spotInfo;
    if (targetPlan === 'founder') {
      updatedSpot = decrementFounderSpots();
    }
    return res.status(200).json({
      success: true,
      isConfigured: false,
      simulated: true,
      plan: targetPlan,
      remainingFounderSpots: updatedSpot.remaining,
      message: "Modo simulação ativo. Servidor Vercel processou o checkout com sucesso."
    });
  }

  const stripe = getStripeInstance(secretKey);
  if (!stripe) {
    return res.status(500).json({
      success: false,
      error: "Failed to initialize Stripe client."
    });
  }

  try {
    const sessionParam: any = {
      payment_method_types: ["card"],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: productName,
              description: productDesc,
            },
            unit_amount: unitAmount,
            ...(mode === "subscription" && recurringInterval ? { recurring: { interval: recurringInterval } } : {}),
          },
          quantity: 1,
        },
      ],
    };

    const session = await stripe.checkout.sessions.create(sessionParam);

    let updatedSpot = spotInfo;
    if (targetPlan === 'founder') {
      updatedSpot = decrementFounderSpots();
    }

    return res.status(200).json({
      success: true,
      isConfigured: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      remainingFounderSpots: updatedSpot.remaining
    });

  } catch (err: any) {
    console.error("[Stripe Serverless Session Error]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Erro ao gerar sessão de pagamento no Stripe."
    });
  }
}
