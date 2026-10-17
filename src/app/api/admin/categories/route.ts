import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const category = await prisma.category.create({ data: { name: name.trim() } });
  return NextResponse.json(category);
}
