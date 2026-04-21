import { prisma } from "@/lib/prisma";
import { AdminLocationClient } from "./client";

export default async function AdminLocationPage() {
  const locations = await prisma.shopLocation.findMany({
    orderBy: { date: "asc" },
  });

  return <AdminLocationClient locations={locations} />;
}
