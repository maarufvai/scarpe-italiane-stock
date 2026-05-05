import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <SessionProvider session={session}>
      <Navbar />
      <div className="flex flex-col flex-1">{children}</div>
      <Footer />
      <CartDrawer />
    </SessionProvider>
  );
}
