import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function auth() {
  return !!(await getServerSession(authOptions));
}

// PATCH /api/admin/products/[id]/variants/[variantId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variantId } = await params;
  const data = await req.json();

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      size: data.size,
      color: data.color,
      colorCode: data.colorCode ?? undefined,
      price: data.price,
      qty: data.qty,
      status: data.status,
    },
  });

  return NextResponse.json(variant);
}

// DELETE /api/admin/products/[id]/variants/[variantId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { variantId } = await params;
  await prisma.productVariant.delete({ where: { id: variantId } });
  return NextResponse.json({ ok: true });
}
