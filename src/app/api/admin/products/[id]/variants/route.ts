import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function auth() {
  return !!(await getServerSession(authOptions));
}

// POST /api/admin/products/[id]/variants
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: productId } = await params;
  const { size, color, colorCode, price, qty } = await req.json();

  if (!size || !color || !price) {
    return NextResponse.json({ error: "size, color, price required" }, { status: 400 });
  }

  const variant = await prisma.productVariant.create({
    data: { productId, size, color, colorCode: colorCode || null, price, qty: qty ?? 0 },
  });

  return NextResponse.json(variant, { status: 201 });
}
