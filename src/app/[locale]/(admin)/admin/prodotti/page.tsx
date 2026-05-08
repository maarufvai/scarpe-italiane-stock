import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ProductsClient } from "./client";

export default async function ProdottiPage() {
  const locale = await getLocale();
  await requireAdmin(locale);

  const [products, brands, categories, colors, genders] = await Promise.all([
    prisma.product.findMany({
      include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.color.findMany({ orderBy: { name: "asc" } }),
    prisma.gender.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <ProductsClient
      products={products}
      brands={brands.map((b) => b.name)}
      categories={categories.map((c) => c.name)}
      colors={colors.map((c) => ({ name: c.name, hex: c.hex }))}
      genders={genders.map((g) => g.name)}
    />
  );
}
