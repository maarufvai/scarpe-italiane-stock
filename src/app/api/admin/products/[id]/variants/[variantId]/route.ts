import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/product-input";

type Params = { params: Promise<{ id: string; variantId: string }> };

const isNonNegInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

// PATCH /api/admin/products/[id]/variants/[variantId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id: productId, variantId } = await params;
  const data = (await req.json().catch(() => null)) ?? {};

  if (data.price !== undefined && (!isNonNegInt(data.price) || data.price === 0)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }
  if (data.qty !== undefined && !isNonNegInt(data.qty)) {
    return NextResponse.json({ error: "Invalid qty" }, { status: 400 });
  }
  if (data.status !== undefined && data.status !== "LIVE" && data.status !== "PAUSED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    // Scoped by productId so a variant can only be edited through its own product
    const variant = await prisma.productVariant.update({
      where: { id: variantId, productId },
      data: {
        size: typeof data.size === "string" && data.size.trim() ? data.size.trim() : undefined,
        color: typeof data.color === "string" ? data.color.trim() : undefined,
        colorCode: data.colorCode ?? undefined,
        price: data.price,
        qty: data.qty,
        status: data.status,
      },
    });
    return NextResponse.json(variant);
  } catch (e) {
    return prismaErrorResponse(e);
  }
}

// DELETE /api/admin/products/[id]/variants/[variantId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id: productId, variantId } = await params;
  try {
    await prisma.productVariant.delete({ where: { id: variantId, productId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return prismaErrorResponse(e);
  }
}
