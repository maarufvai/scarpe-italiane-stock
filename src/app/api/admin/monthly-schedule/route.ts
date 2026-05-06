import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const KEY = "monthly_schedule_url";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  return NextResponse.json({ url: row?.value ?? null });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const row = await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value: url },
    create: { key: KEY, value: url },
  });
  return NextResponse.json({ url: row.value });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.siteSetting.deleteMany({ where: { key: KEY } });
  return NextResponse.json({ ok: true });
}
