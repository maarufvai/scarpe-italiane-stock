import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { OpzioniClient } from "./client";

export default async function OpzioniPage() {
  const locale = await getLocale();
  await requireAdmin(locale);

  const [brands, categories, colors] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.color.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <OpzioniClient brands={brands} categories={categories} colors={colors} />;
}
