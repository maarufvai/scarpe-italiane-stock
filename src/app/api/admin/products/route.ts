import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { parseProductInput, prismaErrorResponse } from "@/lib/product-input";

// GET /api/admin/products
export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

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
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = parseProductInput(await req.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { variants, images, ...fields } = parsed.data;

  // Timestamp + random suffix keeps slugs unique even for simultaneous creates
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const slug = slugify(`${fields.brand}-${fields.nameEn}-${suffix}`) || `product-${suffix}`;

  try {
    const product = await prisma.product.create({
      data: {
        ...fields,
        slug,
        variants: {
          create: variants.map(({ size, color, colorCode, price, qty }) => ({ size, color, colorCode, price, qty })),
        },
        images: images.length
          ? { create: images.map((url, i) => ({ url, position: i })) }
          : undefined,
      },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    return prismaErrorResponse(e);
  }
}
