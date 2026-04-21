import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// action: "increment" | "decrement" | "set"
// set requires qty (number >= 0)
export async function POST(req: NextRequest) {
  const { variantId, action, qty: setQty } = await req.json();
  if (!variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 });

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  let newQty: number;
  if (action === "set") {
    const parsed = parseInt(setQty);
    if (isNaN(parsed) || parsed < 0) return NextResponse.json({ error: "Invalid qty" }, { status: 400 });
    newQty = parsed;
  } else if (action === "decrement") {
    newQty = Math.max(0, variant.qty - 1);
  } else {
    // increment (default)
    newQty = variant.qty + 1;
  }

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { qty: newQty },
  });

  return NextResponse.json({ id: updated.id, qty: updated.qty });
}
