import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SessionProvider } from "@/components/session-provider";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // Login page is inside (admin) group but doesn't need auth
  // Guard is per-page via requireAdmin(); layout just provides shell
  return (
    <SessionProvider session={session}>
      {session ? (
        <div className="min-h-screen flex bg-stone-50">
          <AdminSidebar locale={locale} />
          <main className="flex-1 min-w-0 overflow-auto">{children}</main>
        </div>
      ) : (
        <>{children}</>
      )}
    </SessionProvider>
  );
}
