import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    items, // [{ variantId, qty, priceCents }]
    paymentMethod, paymentId,
    email, firstName, lastName, phone,
    addressLine1, addressLine2, city, province, postalCode, notes,
    shippingCents = 0,
  } = body;

  if (!items?.length || !email || !firstName || !lastName || !addressLine1 || !city || !postalCode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify stock + compute totals server-side
  const variantIds = items.map((i: { variantId: string }) => i.variantId);
  const variants = await prisma.productVariant.findMany({ where: { id: { in: variantIds } } });

  for (const item of items) {
    const v = variants.find((v) => v.id === item.variantId);
    if (!v || v.qty < item.qty || v.status !== "LIVE") {
      return NextResponse.json({ error: `Variant ${item.variantId} unavailable` }, { status: 409 });
    }
  }

  // Compute price from DB — never trust client-supplied priceCents
  const subtotalCents = items.reduce(
    (s: number, i: { qty: number; variantId: string }) => {
      const v = variants.find((v) => v.id === i.variantId);
      return s + (v?.price ?? 0) * i.qty;
    }, 0
  );
  const vatCents = Math.round(subtotalCents * 0.22);
  const totalCents = subtotalCents + vatCents + shippingCents;

  // Create order + deduct stock in transaction
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        status: "PAID",
        paymentMethod: paymentMethod ?? "STRIPE",
        paymentId: paymentId ?? null,
        subtotalCents,
        vatCents,
        totalCents,
        shippingCents,
        email, firstName, lastName,
        phone: phone || null,
        addressLine1,
        addressLine2: addressLine2 || null,
        city, province, postalCode,
        notes: notes || null,
        items: {
          create: items.map((i: { variantId: string; qty: number }) => ({
            variantId: i.variantId,
            qty: i.qty,
            priceCents: variants.find((v) => v.id === i.variantId)?.price ?? 0,
          })),
        },
      },
    });

    // Deduct stock
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { qty: { decrement: item.qty } },
      });
    }

    return o;
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
