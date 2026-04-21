import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

export async function POST(req: NextRequest) {
  const { totalCents, email } = await req.json();

  if (!totalCents || totalCents < 50) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "eur",
    receipt_email: email || undefined,
    metadata: { source: "scarpe-italiane-stock" },
  });

  return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
}
