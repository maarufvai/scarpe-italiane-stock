import { prisma } from "@/lib/prisma";
import { AdminLocationClient } from "./client";

const SCHEDULE_KEYS = ["monthly_schedule_url", "monthly_schedule_url_2"];

export default async function AdminLocationPage() {
  const [locations, scheduleSettings] = await Promise.all([
    prisma.shopLocation.findMany({ orderBy: { date: "asc" } }),
    prisma.siteSetting.findMany({ where: { key: { in: SCHEDULE_KEYS } } }),
  ]);

  const scheduleUrls = SCHEDULE_KEYS.map(
    (k) => scheduleSettings.find((s) => s.key === k)?.value ?? null
  ) as [string | null, string | null];

  return <AdminLocationClient locations={locations} scheduleUrls={scheduleUrls} />;
}
