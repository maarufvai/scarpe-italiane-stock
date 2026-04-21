import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    // Find order by paymentId — may already be PAID if created synchronously
    const order = await prisma.order.findFirst({
      where: { paymentId: intent.id },
    });

    if (order && order.status === "PENDING") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await prisma.order.updateMany({
      where: { paymentId: intent.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ received: true });
}

// Stripe sends raw body — disable Next.js body parsing
export const config = {
  api: { bodyParser: false },
};
