import { requireAdmin } from "@/lib/require-admin";
import { CustomersClient } from "./client";

export default async function CustomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <CustomersClient />;
}
