import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireAdmin(locale = "it") {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/${locale}/admin/login`);
  return session;
}
