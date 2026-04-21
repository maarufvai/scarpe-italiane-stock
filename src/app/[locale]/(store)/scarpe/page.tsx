import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { ProductGrid } from "./product-grid";

export default async function ScarpePage() {
  const locale = await getLocale();

  const products = await prisma.product.findMany({
    where: { variants: { some: { status: "LIVE", qty: { gt: 0 } } } },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: {
        where: { status: "LIVE", qty: { gt: 0 } },
        orderBy: [{ size: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ProductGrid products={products} locale={locale} />;
}
