import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const genders = await prisma.gender.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(genders);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const gender = await prisma.gender.create({ data: { name: name.trim() } });
  return NextResponse.json(gender);
}
