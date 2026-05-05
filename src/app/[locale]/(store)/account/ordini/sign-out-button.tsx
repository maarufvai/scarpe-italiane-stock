"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AccountSignOut({ locale }: { locale: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: `/${locale}/account/login` })}
      className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      {locale === "it" ? "Esci" : "Sign out"}
    </button>
  );
}
