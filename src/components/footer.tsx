import Link from "next/link";
import { getLocale } from "next-intl/server";

export async function Footer() {
  const locale = await getLocale();
  const isIt = locale === "it";

  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-stone-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-100" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 17c0 0 2-3 5-3s4 2 7 2 5-2 5-2" strokeLinecap="round"/>
                <path d="M5 17v-2a7 7 0 0 1 7-7h0a4 4 0 0 1 4 4v2" strokeLinecap="round"/>
                <path d="M9 10v2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-stone-200">Scarpe Italiane Stock</span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs">
            {isIt
              ? "Calzature italiane di qualità. Negozio fisico in Italia con vendita online."
              : "Quality Italian footwear. Physical shop in Italy with online sales."}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
            {isIt ? "Negozio" : "Shop"}
          </p>
          <Link href={`/${locale}/scarpe`} className="text-sm hover:text-stone-200 transition-colors">
            {isIt ? "Tutte le scarpe" : "All shoes"}
          </Link>
          <Link href={`/${locale}/carrello`} className="text-sm hover:text-stone-200 transition-colors">
            {isIt ? "Carrello" : "Cart"}
          </Link>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
            {isIt ? "Info" : "Info"}
          </p>
          <p className="text-sm">{isIt ? "IVA 22% inclusa nei prezzi" : "VAT 22% included in prices"}</p>
          <p className="text-sm">{isIt ? "Spedizione in tutta Italia" : "Shipping across Italy"}</p>
        </div>
      </div>

      <div className="border-t border-stone-800 max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <p className="text-xs text-stone-600">
          © {new Date().getFullYear()} Scarpe Italiane Stock
        </p>
        <p className="text-xs text-stone-600">
          {isIt ? "Fatto in Italia" : "Made in Italy"}
        </p>
      </div>
    </footer>
  );
}
