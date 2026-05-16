import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

// ─── SOCIAL LINKS ────────────────────────────────────────────────────────────
// Replace the URLs below with the real Facebook and Instagram page URLs.
// Set to "" to hide an icon.
const FACEBOOK_URL = "https://www.facebook.com/scarpeitalianestock";
const INSTAGRAM_URL = "https://www.instagram.com/scarpeitalianestock";

export async function Footer() {
  const locale = await getLocale();
  const isIt = locale === "it";

  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Scarpe Italiane"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <span className="text-sm font-bold text-stone-200">
              Scarpe Italiane Stock
            </span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs">
            {isIt
              ? "Calzature italiane di qualità. Negozio fisico in Italia con vendita online."
              : "Quality Italian footwear. Physical shop in Italy with online sales."}
          </p>
          {(FACEBOOK_URL || INSTAGRAM_URL) && (
            <div className="flex items-center gap-2 mt-2">
              {FACEBOOK_URL && (
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#0d65d9] text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <FacebookIcon />
                </a>
              )}
              {INSTAGRAM_URL && (
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  }}
                >
                  <InstagramIcon />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
            {isIt ? "Negozio" : "Shop"}
          </p>
          <Link
            href={`/${locale}/scarpe`}
            className="text-sm hover:text-stone-200 transition-colors"
          >
            {isIt ? "Tutte le scarpe" : "All shoes"}
          </Link>
          <Link
            href={`/${locale}/carrello`}
            className="text-sm hover:text-stone-200 transition-colors"
          >
            {isIt ? "Carrello" : "Cart"}
          </Link>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
            {isIt ? "Info" : "Info"}
          </p>
          <p className="text-sm">
            {isIt ? "Spedizione in tutta Italia" : "Shipping across Italy"}
          </p>
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
