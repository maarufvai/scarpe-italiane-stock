"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, UserCircle, LogIn, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useFavorites } from "@/lib/favorites-store";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";

export function Navbar({
  genders,
  categories,
}: {
  genders: string[];
  categories: string[];
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const cartCount = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const favCount = useFavorites((s) => s.ids.length);
  const openCart = useCart((s) => s.openCart);
  const { data: session } = useSession();

  const pathname = usePathname();
  const otherLocale = locale === "it" ? "en" : "it";
  const switchedPath = pathname.replace(/^\/(it|en)/, `/${otherLocale}`);
  const isIt = locale === "it";

  // Preferred order of gender nav items
  const GENDER_ORDER = ["Uomo", "Donna", "Unisex Uomo/Donna", "Bambini", "Unisex bambino"];
  // Display labels per locale (DB stores Italian; URL uses DB value)
  const GENDER_LABELS: Record<string, { it: string; en: string }> = {
    "Uomo": { it: "Uomo", en: "Men" },
    "Donna": { it: "Donna", en: "Women" },
    "Unisex Uomo/Donna": { it: "Unisex Uomo/Donna", en: "Unisex Men/Women" },
    "Bambini": { it: "Bambini", en: "Kids" },
    "Unisex bambino": { it: "Unisex bambino", en: "Unisex Kids" },
  };
  // Drop "Nuova collezione" if seeded as a gender — handled by dedicated nav link
  const filteredGenders = genders.filter(
    (g) => g.toLowerCase() !== "nuova collezione" && g.toLowerCase() !== "new collection"
  );
  const sortedGenders = [...filteredGenders].sort((a, b) => {
    const ia = GENDER_ORDER.indexOf(a);
    const ib = GENDER_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  const navItems: { label: string; gender: string; type: "gender" }[] =
    sortedGenders.map((g) => ({
      label: GENDER_LABELS[g]?.[locale as "it" | "en"] ?? g,
      gender: g,
      type: "gender" as const,
    }));

  const tNew = isIt ? "Novità" : "New arrivals";
  const tSale = isIt ? "In saldo" : "On sale";
  const tAll = isIt ? "Tutti i prodotti" : "All products";
  const tNewCollection = isIt ? "Nuova collezione" : "New collection";
  const tHighlights = isIt ? "In evidenza" : "Highlights";
  const tCategories = isIt ? "Categorie" : "Categories";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-700 bg-[#faf9f7]/95 dark:bg-stone-900/95 backdrop-blur-sm"
      onMouseLeave={() => setHovered(null)}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

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
          <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap hidden sm:inline">
            Scarpe Italiane Stock
          </span>
        </Link>

        {/* Desktop nav with mega-menu */}
        <nav className="hidden md:flex items-center gap-7 h-full">
          <div
            onMouseEnter={() => setHovered(null)}
            className="h-full flex items-center"
          >
            <Link
              href={`/${locale}/scarpe`}
              className={`text-sm font-semibold transition-colors py-1 border-b-2 ${
                pathname === `/${locale}/scarpe` && !hovered
                  ? "border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white"
                  : "border-transparent text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              {tAll}
            </Link>
          </div>
          <div
            onMouseEnter={() => setHovered(null)}
            className="h-full flex items-center"
          >
            <Link
              href={`/${locale}/scarpe?sort=newest`}
              className="text-sm font-medium transition-colors py-1 border-b-2 border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            >
              {tNewCollection}
            </Link>
          </div>
          {navItems.map((item) => (
            <div
              key={item.label}
              onMouseEnter={() => setHovered(item.label)}
              className="h-full flex items-center"
            >
              <Link
                href={`/${locale}/scarpe?gender=${encodeURIComponent(item.gender)}`}
                className={`text-sm font-medium transition-colors py-1 border-b-2 ${
                  hovered === item.label
                    ? "border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white"
                    : "border-transparent text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href={switchedPath}
            className="text-xs font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors px-2 py-1 rounded border border-transparent hover:border-stone-200 dark:hover:border-stone-600"
          >
            {otherLocale}
          </Link>

          <ThemeToggle />

          {/* Favorites */}
          <Link
            href={`/${locale}/preferiti`}
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            aria-label={isIt ? "Preferiti" : "Favorites"}
          >
            <Heart className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            {favCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favCount > 9 ? "9+" : favCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {session ? (
            <Link
              href={`/${locale}/account/ordini`}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label={isIt ? "Il mio account" : "My account"}
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
              aria-label={isIt ? "Accedi" : "Sign in"}
            >
              <LogIn className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            aria-label={isIt ? "Carrello" : "Cart"}
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

      {/* Mega-menu panel — desktop only, visible while hovering a top nav item */}
      {hovered && (
        <div className="hidden md:block absolute top-full left-0 right-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 gap-8">
            {/* Highlights */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">{tHighlights}</p>
              <Link
                href={
                  `/${locale}/scarpe?gender=${encodeURIComponent(hovered)}`
                }
                className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                {tAll}
              </Link>
              <Link
                href={`/${locale}/scarpe?gender=${encodeURIComponent(hovered)}&sort=newest`}
                className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                {tNew}
              </Link>
              <Link
                href={`/${locale}/scarpe?gender=${encodeURIComponent(hovered)}&sale=1`}
                className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
              >
                {tSale}
              </Link>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-2 col-span-2">
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">{tCategories}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={`/${locale}/scarpe?gender=${encodeURIComponent(hovered)}&category=${encodeURIComponent(c)}`}
                    className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    {c}
                  </Link>
                ))}
                {categories.length === 0 && (
                  <span className="text-sm text-stone-400 italic">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-700 bg-[#faf9f7] dark:bg-stone-900 px-4 py-4 flex flex-col gap-1">
          <Link
            href={`/${locale}/scarpe`}
            className="text-sm font-medium text-stone-700 dark:text-stone-200 py-2"
            onClick={() => setOpen(false)}
          >
            {tAll}
          </Link>
          <Link
            href={`/${locale}/scarpe?sort=newest`}
            className="text-sm font-medium text-stone-700 dark:text-stone-200 py-2"
            onClick={() => setOpen(false)}
          >
            {tNewCollection}
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.gender}
              href={`/${locale}/scarpe?gender=${encodeURIComponent(item.gender)}`}
              className="text-sm font-medium text-stone-700 dark:text-stone-200 py-2 pl-3"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/preferiti`}
            className="text-sm font-medium text-stone-700 dark:text-stone-200 py-2 flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Heart className="w-4 h-4" />
            {isIt ? "Preferiti" : "Favorites"}
            {favCount > 0 && (
              <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {favCount}
              </span>
            )}
          </Link>
          <Link
            href={session ? `/${locale}/account/ordini` : `/${locale}/account/login`}
            className="text-sm font-medium text-stone-700 dark:text-stone-200 py-2"
            onClick={() => setOpen(false)}
          >
            {session
              ? (isIt ? "Il mio account" : "My account")
              : (isIt ? "Accedi" : "Sign in")}
          </Link>
          <button
            className="text-sm font-medium text-stone-700 dark:text-stone-200 py-2 text-left"
            onClick={() => { setOpen(false); openCart(); }}
          >
            {isIt ? "Carrello" : "Cart"}
          </button>
        </div>
      )}
    </header>
  );
}
