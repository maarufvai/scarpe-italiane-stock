import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import Image from "next/image";
import { LoginForm } from "./form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();
  if (session) redirect(`/${locale}/admin/prodotti`);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <Image
              src="/logo.png"
              alt="Scarpe Italiane"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="text-sm font-bold text-stone-900">Scarpe Italiane Stock</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Admin</h1>
          <p className="text-sm text-stone-500 mt-1">Accedi per gestire il negozio</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
