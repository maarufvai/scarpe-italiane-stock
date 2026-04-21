import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { LoginForm } from "./form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();
  if (session) redirect(`/${locale}/admin/prodotti`);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-sm bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-amber-100" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 17c0 0 2-3 5-3s4 2 7 2 5-2 5-2" strokeLinecap="round"/>
                <path d="M5 17v-2a7 7 0 0 1 7-7h0a4 4 0 0 1 4 4v2" strokeLinecap="round"/>
                <path d="M9 10v2" strokeLinecap="round"/>
              </svg>
            </div>
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
