import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

async function auth() {
  const s = await getServerSession(authOptions);
  return !!s;
}

// GET /api/admin/products
export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { nameIt, nameEn, descIt, descEn, brand, category, season, sale, barcode, variants, images } = body;

  if (!nameIt || !nameEn || !brand || !category) {
    return NextResponse.json({ error: "nameIt, nameEn, brand, category required" }, { status: 400 });
  }

  const baseSlug = slugify(`${brand}-${nameEn}`);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      nameIt,
      nameEn,
      descIt: descIt || null,
      descEn: descEn || null,
      brand,
      category,
      season: season || null,
      sale: sale ?? 0,
      barcode: barcode || null,
      variants: variants?.length
        ? {
            create: variants.map((v: {
              size: string; color: string; colorCode?: string;
              price: number; qty: number;
            }) => ({
              size: v.size,
              color: v.color,
              colorCode: v.colorCode || null,
              price: v.price,
              qty: v.qty,
            })),
          }
        : undefined,
      images: images?.length
        ? { create: images.map((url: string, i: number) => ({ url, position: i })) }
        : undefined,
    },
    include: {
      variants: true,
      images: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
