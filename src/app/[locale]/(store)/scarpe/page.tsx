import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ProductGrid } from "./product-grid";

export default async function ScarpePage() {
  const locale = await getLocale();

  const [products, brands, categories, colors] = await Promise.all([
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
  ]);

  return (
    <ProductGrid
      products={products}
      locale={locale}
      brandOptions={brands.map((b) => b.name)}
      categoryOptions={categories.map((c) => c.name)}
      colorOptions={colors.map((c) => ({ name: c.name, hex: c.hex }))}
    />
  );
}
