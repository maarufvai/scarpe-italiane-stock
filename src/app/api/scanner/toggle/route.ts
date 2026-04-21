import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Legacy endpoint — kept for compatibility. New scanner uses /api/scanner/lookup + /api/scanner/variant
export async function POST(req: NextRequest) {
  const { barcode } = await req.json();
  if (!barcode) return NextResponse.json({ error: "Barcode required" }, { status: 400 });

  // barcode is now on Product, not ProductVariant
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { variants: { take: 1 } },
  });

  if (!product || !product.variants[0]) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const variant = product.variants[0];
  const newStatus = variant.status === "LIVE" ? "PAUSED" : "LIVE";

  const updated = await prisma.productVariant.update({
    where: { id: variant.id },
    data: { status: newStatus },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    size: updated.size,
    color: updated.color,
    productName: product.nameIt,
  });
}
