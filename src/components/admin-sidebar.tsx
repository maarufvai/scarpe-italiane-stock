"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Package, ShoppingBag, MapPin, ScanBarcode, LogOut, LayoutDashboard, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const labels = {
  it: {
    products: "Prodotti",
    orders: "Ordini",
    customers: "Clienti",
    locations: "Sedi",
    scanner: "Scanner",
    viewStore: "Vedi negozio",
    logout: "Esci",
    language: "Lingua",
  },
  en: {
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    locations: "Locations",
    scanner: "Scanner",
    viewStore: "View store",
    logout: "Sign out",
    language: "Language",
  },
};

const navItems = (locale: string, t: typeof labels["it"]) => [
  { href: `/${locale}/admin/prodotti`, icon: Package, label: t.products },
  { href: `/${locale}/admin/ordini`, icon: ShoppingBag, label: t.orders },
  { href: `/${locale}/admin/clienti`, icon: Users, label: t.customers },
  { href: `/${locale}/admin/location`, icon: MapPin, label: t.locations },
  { href: `/${locale}/admin/scanner`, icon: ScanBarcode, label: t.scanner },
];

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = labels[locale as "it" | "en"] ?? labels.it;
  const otherLocale = locale === "it" ? "en" : "it";

  function switchLocale() {
    // Replace /it/ or /en/ prefix in pathname
    const newPath = pathname.replace(/^\/(it|en)/, `/${otherLocale}`);
    router.push(newPath);
  }

  return (
    <aside className="w-56 shrink-0 border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-stone-100">
        <div className="w-7 h-7 rounded-sm bg-stone-900 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-100" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 17c0 0 2-3 5-3s4 2 7 2 5-2 5-2" strokeLinecap="round"/>
            <path d="M5 17v-2a7 7 0 0 1 7-7h0a4 4 0 0 1 4 4v2" strokeLinecap="round"/>
            <path d="M9 10v2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex flex-col leading-none min-w-0">
          <span className="text-xs font-bold text-stone-900 truncate">Scarpe Italiane</span>
          <span className="text-[9px] font-semibold tracking-widest text-stone-400 uppercase">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {navItems(locale, t).map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-stone-100 dark:border-stone-700 flex flex-col gap-0.5">

        {/* Dark mode toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span className="text-xs text-stone-400 flex-1">
            {locale === "it" ? "Tema" : "Theme"}
          </span>
          <ThemeToggle />
        </div>

        {/* Language toggle */}
        <div className="flex items-center gap-1 px-3 py-2 rounded-lg">
          <span className="text-xs text-stone-400 mr-auto">{t.language}</span>
          <button
            onClick={() => locale !== "it" && switchLocale()}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              locale === "it"
                ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900"
                : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            )}
            title="Italiano"
          >
            <span className="text-base leading-none">🇮🇹</span>
            <span>IT</span>
          </button>
          <button
            onClick={() => locale !== "en" && switchLocale()}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              locale === "en"
                ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900"
                : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            )}
            title="English"
          >
            <span className="text-base leading-none">🇬🇧</span>
            <span>EN</span>
          </button>
        </div>

        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100 transition-colors"
          target="_blank"
        >
          <LayoutDashboard className="w-4 h-4" />
          {t.viewStore}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
