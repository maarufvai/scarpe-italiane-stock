import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductDetail } from "./product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ size: "asc" }, { color: "asc" }] },
    },
  });

  if (!product) notFound();

  return <ProductDetail product={product} locale={locale} />;
}
