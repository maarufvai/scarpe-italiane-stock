import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST { items: [{variantId, qty}] }
// Returns per-item available stock so client can show warnings
export async function POST(req: NextRequest) {
  const { items } = await req.json() as { items: { variantId: string; qty: number }[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, qty: true },
  });

  const stockMap = Object.fromEntries(variants.map((v) => [v.id, v.qty]));

  const results = items.map((item) => {
    const available = stockMap[item.variantId] ?? 0;
    return { variantId: item.variantId, available, ok: item.qty <= available };
  });

  return NextResponse.json({ results, valid: results.every((r) => r.ok) });
}
