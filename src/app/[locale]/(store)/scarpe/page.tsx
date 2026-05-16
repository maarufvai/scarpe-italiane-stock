import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ProductGrid } from "./product-grid";

export default async function ScarpePage() {
  const locale = await getLocale();

  const [products, brands, categories, colors, genders, popularityRaw] = await Promise.all([
    prisma.product.findMany({
      where: { variants: { some: { status: "LIVE", qty: { gt: 0 } } } },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { where: { status: "LIVE", qty: { gt: 0 } }, orderBy: [{ size: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.color.findMany({ orderBy: { name: "asc" } }),
    prisma.gender.findMany({ orderBy: { name: "asc" } }),
    prisma.productVariant.findMany({
      select: { productId: true, orderItems: { select: { qty: true } } },
    }),
  ]);

  const popMap = new Map<string, number>();
  for (const v of popularityRaw) {
    const sum = v.orderItems.reduce((s, i) => s + i.qty, 0);
    popMap.set(v.productId, (popMap.get(v.productId) ?? 0) + sum);
  }

  const productsWithPop = products.map((p) => ({
    ...p,
    popularity: popMap.get(p.id) ?? 0,
  }));

  return (
    <ProductGrid
      products={productsWithPop}
      locale={locale}
      brandOptions={brands.map((b) => b.name)}
      categoryOptions={categories.map((c) => c.name)}
      colorOptions={colors.map((c) => ({ name: c.name, hex: c.hex }))}
      genderOptions={genders.map((g) => g.name)}
    />
  );
}
