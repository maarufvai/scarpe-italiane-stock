import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  return true;
}

// GET /api/admin/shop-location — all locations
export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.shopLocation.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(locations);
}

// POST /api/admin/shop-location — upsert by date
export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, address, lat, lng, noteIt, noteEn } = body;

  if (!date || !address) {
    return NextResponse.json(
      { error: "date and address required" },
      { status: 400 }
    );
  }

  const location = await prisma.shopLocation.upsert({
    where: { date: new Date(date) },
    update: { address, lat, lng, noteIt, noteEn },
    create: { date: new Date(date), address, lat, lng, noteIt, noteEn },
  });

  return NextResponse.json(location);
}

// DELETE /api/admin/shop-location?date=YYYY-MM-DD
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  if (!dateParam)
    return NextResponse.json({ error: "date required" }, { status: 400 });

  await prisma.shopLocation.delete({ where: { date: new Date(dateParam) } });
  return NextResponse.json({ ok: true });
}
