import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFounderSpots } from "../pricing/_spots";

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

  const isConfigured = !!process.env.STRIPE_SECRET_KEY;
  const spots = getFounderSpots();

  return res.status(200).json({
    success: true,
    isConfigured,
    founderSpots: {
      remaining: spots.remaining,
      total: spots.total
    },
    prices: {
      en: {
        monthly: { currency: "USD", amount: 19.99 },
        annual: { currency: "USD", amount: 119.88, monthlyEquivalent: 9.99 },
        founder: { currency: "USD", amount: 99.00 }
      },
      es: {
        monthly: { currency: "EUR", amount: 19.99 },
        annual: { currency: "EUR", amount: 118.80, monthlyEquivalent: 9.90 },
        founder: { currency: "EUR", amount: 99.00 }
      },
      pt: {
        monthly: { currency: "BRL", amount: 97.90 },
        annual: { currency: "BRL", amount: 598.80, monthlyEquivalent: 49.90 },
        founder: { currency: "BRL", amount: 497.00 }
      }
    }
  });
}
