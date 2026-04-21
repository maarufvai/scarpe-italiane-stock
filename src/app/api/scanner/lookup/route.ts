import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { barcode } = await req.json();
  if (!barcode) return NextResponse.json({ error: "Barcode required" }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { barcode: { equals: barcode, mode: "insensitive" } },
    include: {
      variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json({
    id: product.id,
    nameIt: product.nameIt,
    barcode: product.barcode,
    image: product.images[0]?.url ?? null,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorCode: v.colorCode,
      qty: v.qty,
    })),
  });
}
