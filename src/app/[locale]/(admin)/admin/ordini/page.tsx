import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersClient } from "./client";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  return <OrdersClient />;
}
