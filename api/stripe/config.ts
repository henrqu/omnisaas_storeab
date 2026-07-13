import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(455).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  console.log("Environment:", process.env.NODE_ENV);
  console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      error: "Missing STRIPE_SECRET_KEY environment variable."
    });
  }

  return res.status(200).json({
    success: true,
    isConfigured: true,
    prices: {
      en: { currency: "USD", amount: 19.99, priceId: process.env.STRIPE_PRICE_USD || "" },
      es: { currency: "EUR", amount: 19.99, priceId: process.env.STRIPE_PRICE_EUR || "" },
      pt: { currency: "BRL", amount: 97.90, priceId: process.env.STRIPE_PRICE_BRL || "" }
    }
  });
}
