import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Slot 1 keeps the historic key so existing rows keep working.
const KEYS = ["monthly_schedule_url", "monthly_schedule_url_2"] as const;

function keyForSlot(slot: unknown): string | null {
  const n = Number(slot ?? 1);
  return n === 1 || n === 2 ? KEYS[n - 1] : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...KEYS] } } });
  const urls = KEYS.map((k) => rows.find((r) => r.key === k)?.value ?? null);
  return NextResponse.json({ urls, url: urls[0] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, slot } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const key = keyForSlot(slot);
  if (!key) return NextResponse.json({ error: "slot must be 1 or 2" }, { status: 400 });

  const row = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: url },
    create: { key, value: url },
  });
  return NextResponse.json({ url: row.value, slot: KEYS.indexOf(key as (typeof KEYS)[number]) + 1 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = keyForSlot(req.nextUrl.searchParams.get("slot"));
  if (!key) return NextResponse.json({ error: "slot must be 1 or 2" }, { status: 400 });

  await prisma.siteSetting.deleteMany({ where: { key } });
  return NextResponse.json({ ok: true });
}
