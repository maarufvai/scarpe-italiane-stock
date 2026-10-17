import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const colors = await prisma.color.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(colors);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { name, hex } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const color = await prisma.color.create({ data: { name: name.trim(), hex: hex ?? "#000000" } });
  return NextResponse.json(color);
}
