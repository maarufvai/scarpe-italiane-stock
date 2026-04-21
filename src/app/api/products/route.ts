import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      variants: {
        some: { status: "LIVE", qty: { gt: 0 } },
      },
    },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: {
        where: { status: "LIVE", qty: { gt: 0 } },
        orderBy: [{ size: "asc" }, { color: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
