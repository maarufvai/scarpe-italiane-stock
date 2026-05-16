import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [session, genders, categories] = await Promise.all([
    getServerSession(authOptions),
    prisma.gender.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <SessionProvider session={session}>
      <Navbar
        genders={genders.map((g) => g.name)}
        categories={categories.map((c) => c.name)}
      />
      <div className="flex flex-col flex-1">{children}</div>
      <Footer />
      <CartDrawer />
    </SessionProvider>
  );
}
