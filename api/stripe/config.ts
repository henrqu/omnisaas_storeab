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
        monthly: { currency: "USD", amount: 19.99, priceId: "price_1TrfkaQgM79UmffPY33Spfuc" },
        annual: { currency: "USD", amount: 119.88, monthlyEquivalent: 9.99, priceId: "price_1TwimKQgM79UmffPlbyeMuPI" },
        founder: { currency: "USD", amount: 99.00, priceId: "price_1Twip6QgM79UmffPy9urRCrr" }
      },
      es: {
        monthly: { currency: "EUR", amount: 19.99, priceId: "price_1TrfnaQgM79UmffPZE43dIsx" },
        annual: { currency: "EUR", amount: 118.80, monthlyEquivalent: 9.90, priceId: "price_1TwinCQgM79UmffPjj7PuFKa" },
        founder: { currency: "EUR", amount: 99.00, priceId: "price_1Twiq5QgM79UmffPFo3AqSUB" }
      },
      pt: {
        monthly: { currency: "BRL", amount: 97.90, priceId: "price_1TrfmcQgM79UmffPGSpl0cLV" },
        annual: { currency: "BRL", amount: 598.80, monthlyEquivalent: 49.90, priceId: "price_1TwinfQgM79UmffPNdXFOtaa" },
        founder: { currency: "BRL", amount: 497.00, priceId: "price_1Twir1QgM79UmffPAsh0E1LA" }
      }
    }
  });
}
