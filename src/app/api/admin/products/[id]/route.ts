import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function auth() {
  const s = await getServerSession(authOptions);
  return !!s;
}

// PATCH /api/admin/products/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { descIt, descEn, brand, categories, genders, season, sale, barcode, variants, images } = body;
  let { nameIt, nameEn } = body;

  // Mirror name across locales if only one provided
  const itTrim = (nameIt || "").trim();
  const enTrim = (nameEn || "").trim();
  if (itTrim && !enTrim) nameEn = itTrim;
  else if (enTrim && !itTrim) nameIt = enTrim;

  // Upsert variants if provided
  if (variants?.length) {
    const survivingIds: string[] = [];
    for (const v of variants) {
      if (v.id) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { size: v.size, color: v.color, colorCode: v.colorCode, price: v.price, qty: v.qty },
        });
        survivingIds.push(v.id);
      } else {
        const created = await prisma.productVariant.create({
          data: { productId: id, size: v.size, color: v.color, colorCode: v.colorCode, price: v.price, qty: v.qty },
        });
        survivingIds.push(created.id);
      }
    }
    // Remove variants not in the surviving set (existing + newly created)
    await prisma.productVariant.deleteMany({ where: { productId: id, id: { notIn: survivingIds } } });
  }

  // Replace images if provided
  if (images !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map((url: string, i: number) => ({ productId: id, url, position: i })),
      });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: { nameIt, nameEn, descIt, descEn, brand, categories: Array.isArray(categories) ? categories : [], genders: Array.isArray(genders) ? genders : [], season: season || null, sale: sale ?? 0, barcode: barcode ?? null },
    include: { variants: true, images: true },
  });

  return NextResponse.json(product);
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Find all order items referencing this product's variants, joined to their order status
  const variantIds = await prisma.productVariant
    .findMany({ where: { productId: id }, select: { id: true } })
    .then((vs) => vs.map((v) => v.id));

  if (variantIds.length > 0) {
    // Check for any active (non-completed) orders
    const activeOrder = await prisma.orderItem.findFirst({
      where: {
        variantId: { in: variantIds },
        order: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      },
      select: { order: { select: { status: true } } },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: `Cannot delete — has an active order (${activeOrder.order.status})` },
        { status: 409 }
      );
    }

    // All referencing orders are DELIVERED or CANCELLED — remove order items so FK is clear
    await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
