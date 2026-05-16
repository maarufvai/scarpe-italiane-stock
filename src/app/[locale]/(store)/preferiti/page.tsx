import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { FavoritesClient } from "./favorites-client";

export default async function FavoritesPage() {
  const locale = await getLocale();

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { where: { status: "LIVE" }, orderBy: [{ size: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  return <FavoritesClient products={products} locale={locale} />;
}
