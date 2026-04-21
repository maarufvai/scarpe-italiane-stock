import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ProductsClient } from "./client";

export default async function ProdottiPage() {
  const locale = await getLocale();
  await requireAdmin(locale);

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <ProductsClient products={products} />;
}
