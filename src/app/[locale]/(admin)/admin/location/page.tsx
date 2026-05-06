import { prisma } from "@/lib/prisma";
import { AdminLocationClient } from "./client";

export default async function AdminLocationPage() {
  const [locations, scheduleSetting] = await Promise.all([
    prisma.shopLocation.findMany({ orderBy: { date: "asc" } }),
    prisma.siteSetting.findUnique({ where: { key: "monthly_schedule_url" } }),
  ]);

  return (
    <AdminLocationClient
      locations={locations}
      scheduleUrl={scheduleSetting?.value ?? null}
    />
  );
}
