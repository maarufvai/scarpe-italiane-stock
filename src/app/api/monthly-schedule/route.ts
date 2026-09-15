import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const KEYS = ["monthly_schedule_url", "monthly_schedule_url_2"];

export async function GET() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: KEYS } } });
  const urls = KEYS.map((k) => rows.find((r) => r.key === k)?.value ?? null);
  return NextResponse.json({ urls, url: urls[0] });
}
