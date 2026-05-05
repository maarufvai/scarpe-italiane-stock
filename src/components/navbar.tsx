"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, UserCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";

export function Navbar() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const openCart = useCart((s) => s.openCart);
  const { data: session } = useSession();

  const pathname = usePathname();
  const otherLocale = locale === "it" ? "en" : "it";
  const switchedPath = pathname.replace(/^\/(it|en)/, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-700 bg-[#faf9f7]/95 dark:bg-stone-900/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo.png"
            alt="Scarpe Italiane"
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">Scarpe Italiane</span>
            <span className="text-[10px] font-medium tracking-widest text-stone-400 dark:text-stone-500 uppercase">Stock</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}/scarpe`} className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors">
            {t("products")}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Lang toggle */}
          <Link
            href={switchedPath}
            className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors px-2 py-1 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-600"
          >
            {otherLocale}
          </Link>

          <ThemeToggle />

          {/* Account */}
          {session ? (
            <Link
              href={`/${locale}/account/ordini`}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label={locale === "it" ? "Il mio account" : "My account"}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Account"}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <UserCircle className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              )}
            </Link>
          ) : (
            <Link
              href={`/${locale}/account/login`}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label={locale === "it" ? "Accedi" : "Sign in"}
            >
              <LogIn className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            aria-label={t("cart")}
          >
            <ShoppingBag className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-700 bg-[#faf9f7] dark:bg-stone-900 px-4 py-4 flex flex-col gap-3">
          <Link
            href={`/${locale}/scarpe`}
            className="text-sm font-medium text-stone-700 py-2"
            onClick={() => setOpen(false)}
          >
            {t("products")}
          </Link>
          <Link
            href={session ? `/${locale}/account/ordini` : `/${locale}/account/login`}
            className="text-sm font-medium text-stone-700 py-2"
            onClick={() => setOpen(false)}
          >
            {session
              ? (locale === "it" ? "Il mio account" : "My account")
              : (locale === "it" ? "Accedi" : "Sign in")}
          </Link>
          <button
            className="text-sm font-medium text-stone-700 py-2 text-left"
            onClick={() => { setOpen(false); openCart(); }}
          >
            {t("cart")}
          </button>
        </div>
      )}
    </header>
  );
}
