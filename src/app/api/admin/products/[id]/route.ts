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
  const { nameIt, nameEn, descIt, descEn, brand, categories, genders, season, sale, barcode, variants, images } = body;

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
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // Prisma P2003 = foreign key constraint: product has order items referencing its variants
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete — product has associated orders" },
        { status: 409 }
      );
    }
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
