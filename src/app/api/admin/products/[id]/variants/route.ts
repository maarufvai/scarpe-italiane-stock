import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/product-input";

const isNonNegInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

// POST /api/admin/products/[id]/variants
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id: productId } = await params;
  const { size, color, colorCode, price, qty = 0 } = (await req.json().catch(() => ({}))) ?? {};

  if (typeof size !== "string" || !size.trim() || typeof color !== "string" || !isNonNegInt(price) || price === 0) {
    return NextResponse.json({ error: "size, color, price required" }, { status: 400 });
  }
  if (!isNonNegInt(qty)) return NextResponse.json({ error: "Invalid qty" }, { status: 400 });

  try {
    const variant = await prisma.productVariant.create({
      data: { productId, size: size.trim(), color: color.trim(), colorCode: colorCode || null, price, qty },
    });
    return NextResponse.json(variant, { status: 201 });
  } catch (e) {
    return prismaErrorResponse(e);
  }
}
