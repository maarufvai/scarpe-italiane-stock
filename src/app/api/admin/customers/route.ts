import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get("sort") ?? "createdAt";
  const sortDir = (searchParams.get("dir") ?? "desc") as "asc" | "desc";

  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: {
          totalCents: true,
          items: { select: { qty: true } },
        },
      },
    },
  });

  const customers = users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    image: u.image,
    createdAt: u.createdAt.toISOString(),
    orderCount: u.orders.length,
    totalSpentCents: u.orders.reduce((s, o) => s + o.totalCents, 0),
    shoeCount: u.orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty, 0), 0),
  }));

  const sorted = [...customers].sort((a, b) => {
    let av: string | number = a[sortBy as keyof typeof a] ?? "";
    let bv: string | number = b[sortBy as keyof typeof b] ?? "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return NextResponse.json({ customers: sorted });
}
