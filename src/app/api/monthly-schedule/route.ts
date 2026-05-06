import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const row = await prisma.siteSetting.findUnique({
    where: { key: "monthly_schedule_url" },
  });
  return NextResponse.json({ url: row?.value ?? null });
}
