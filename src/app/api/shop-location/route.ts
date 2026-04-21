import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shop-location?date=YYYY-MM-DD
// GET /api/shop-location?all=true  (returns all dates that have a location)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.get("all") === "true") {
    const locations = await prisma.shopLocation.findMany({
      select: { date: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(locations.map((l) => l.date));
  }

  const dateParam = searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  const location = await prisma.shopLocation.findUnique({
    where: { date: new Date(dateParam) },
  });

  if (!location) {
    return NextResponse.json(null);
  }

  return NextResponse.json(location);
}
