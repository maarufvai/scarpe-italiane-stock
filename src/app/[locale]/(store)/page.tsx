import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShopLocationWidget } from "@/components/shop-location-widget";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ArrowRight, MapPin } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();

  const markedLocations = await prisma.shopLocation.findMany({
    select: { date: true },
    orderBy: { date: "asc" },
  });
  const markedDates = markedLocations.map((l) => l.date.toISOString());
  const isIt = locale === "it";

  const marqueeItems = [
    isIt ? "IVA 22% inclusa" : "VAT 22% included",
    isIt ? "Spedizione in tutta Italia" : "Shipping across Italy",
    isIt ? "Negozio fisico in Italia" : "Physical shop in Italy",
    isIt ? "Qualità artigianale" : "Artisan quality",
    isIt ? "Disponibilità limitata" : "Limited availability",
  ];

  return (
    <main className="flex-1 flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#100f0d] text-white min-h-screen flex items-center">

        {/* Watermark */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span className="font-display text-[22vw] font-bold italic tracking-tighter leading-none text-white/[0.025] whitespace-nowrap">
            ITALIANE
          </span>
        </div>

        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text column */}
          <div className="flex flex-col gap-8">

            <div
              className="hero-animate inline-flex items-center gap-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-amber-400 w-fit"
              style={{ animationDelay: "0ms" }}
            >
              <span className="w-5 h-px bg-amber-400" />
              {isIt ? "Negozio fisico · Online" : "Physical shop · Online"}
            </div>

            <div className="hero-animate flex flex-col" style={{ animationDelay: "120ms" }}>
              <h1 className="font-display leading-[0.9] tracking-tight">
                {isIt ? (
                  <>
                    <span className="block text-6xl lg:text-[7rem] font-light text-white">L&apos;Arte</span>
                    <span className="block text-6xl lg:text-[7rem] font-light italic text-amber-400">delle Scarpe</span>
                    <span className="block text-4xl lg:text-6xl font-light text-white/50 mt-2">Italiane</span>
                  </>
                ) : (
                  <>
                    <span className="block text-6xl lg:text-[7rem] font-light text-white">The Art of</span>
                    <span className="block text-6xl lg:text-[7rem] font-light italic text-amber-400">Italian</span>
                    <span className="block text-4xl lg:text-6xl font-light text-white/50 mt-2">Footwear</span>
                  </>
                )}
              </h1>
            </div>

            <div
              className="hero-animate flex items-start gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <div className="h-px w-8 bg-stone-600 mt-3 shrink-0" />
              <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
                {isIt
                  ? "Calzature artigianali italiane a prezzi accessibili. Collezione selezionata, disponibilità limitata."
                  : "Italian artisan footwear at accessible prices. Curated selection, limited availability."}
              </p>
            </div>

            <div
              className="hero-animate flex items-center gap-5 flex-wrap"
              style={{ animationDelay: "360ms" }}
            >
              <Link
                href={`/${locale}/scarpe`}
                className="group inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-7 py-3.5 text-sm tracking-wider uppercase transition-all duration-300"
              >
                {t("home.shop_now")}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#dove-siamo"
                className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-sm tracking-wide transition-colors border-b border-stone-700 hover:border-stone-400 pb-px"
              >
                <MapPin className="w-3.5 h-3.5" />
                {isIt ? "Dove siamo" : "Find us"}
              </Link>
            </div>
          </div>

          {/* Shoe column */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-[440px] lg:h-[440px]">
              <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-6 rounded-full border border-amber-400/[0.08]" />
              <div className="absolute inset-0 rounded-full bg-amber-400/[0.04] blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-amber-400/10 blur-2xl" />

              <div className="animate-float w-full h-full">
                {/* Italian leather loafer */}
                <svg viewBox="0 0 520 280" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                  {/* Shadow */}
                  <ellipse cx="262" cy="272" rx="178" ry="8" fill="#000" opacity="0.4" />

                  {/* Outsole */}
                  <path d="M 82 242 Q 76 250 104 254 L 402 254 Q 432 252 436 242 Q 440 232 430 228 L 102 228 Q 79 230 82 242" fill="#0d0d0d" />

                  {/* Heel block */}
                  <path d="M 382 228 L 382 206 Q 394 200 414 208 L 430 218 L 430 228 Z" fill="#0a0a0a" />

                  {/* Outsole accent stripe */}
                  <path d="M 140 254 L 398 254" fill="none" stroke="#52b788" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />

                  {/* Main upper — body */}
                  <path d="M 388 202 Q 412 193 416 174 Q 413 146 396 136 Q 372 126 336 126 Q 296 125 256 129 Q 216 133 176 140 Q 140 148 116 163 Q 96 176 88 196 Q 83 216 90 228 L 388 228 Z" fill="#1c1c1c" />

                  {/* Heel counter */}
                  <path d="M 368 128 Q 398 124 414 142 Q 418 162 414 180 L 396 188 Q 402 164 397 146 Q 388 132 368 131 Z" fill="#161616" />

                  {/* Toe cap */}
                  <path d="M 90 228 Q 83 216 88 196 Q 96 176 116 163 Q 136 153 158 152 L 152 176 Q 128 179 112 193 Q 99 207 95 228 Z" fill="#151515" />

                  {/* Toe cap stitch */}
                  <path d="M 111 190 Q 130 175 152 172" fill="none" stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3,2.5" />

                  {/* Vamp / collar opening edge */}
                  <path d="M 158 152 Q 214 137 278 131 Q 344 126 388 136" fill="none" stroke="#2a2a2a" strokeWidth="2" />

                  {/* Collar stitching */}
                  <path d="M 158 152 Q 214 137 278 131 Q 344 126 388 136" fill="none" stroke="#363636" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.7" />

                  {/* Gold loafer bit — bar */}
                  <rect x="238" y="124" width="50" height="11" rx="3" fill="#c49a2e" />
                  {/* Bit frame */}
                  <rect x="241" y="121" width="44" height="17" rx="2.5" fill="none" stroke="#d4a853" strokeWidth="1.8" opacity="0.85" />
                  {/* Bit center pin */}
                  <line x1="263" y1="121" x2="263" y2="138" stroke="#b8862a" strokeWidth="1.2" opacity="0.6" />
                  <line x1="275" y1="121" x2="275" y2="138" stroke="#b8862a" strokeWidth="1.2" opacity="0.6" />
                  {/* Bit shine */}
                  <rect x="244" y="124" width="16" height="4" rx="1.5" fill="white" opacity="0.12" />

                  {/* Upper leather highlight */}
                  <path d="M 120 163 Q 204 140 316 129 Q 372 125 402 138" fill="none" stroke="#fff" strokeWidth="1" opacity="0.06" strokeLinecap="round" />
                </svg>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-amber-400/25" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-amber-400/25" />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0908] to-transparent" />
      </section>

      {/* ── Marquee strip ────────────────────────────────────────────────── */}
      <div className="bg-amber-400 text-stone-900 overflow-hidden py-3 border-y-2 border-amber-500">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-6 text-[11px] font-bold tracking-[0.2em] uppercase">
              {item}
              <span className="text-amber-600 text-xs">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-[#faf9f7] dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3">
          {[
            {
              num: "01",
              title: isIt ? "IVA Inclusa" : "VAT Included",
              desc: isIt
                ? "Prezzi trasparenti. IVA 22% italiana già inclusa in ogni acquisto."
                : "Transparent pricing. Italian VAT 22% already included in every purchase.",
              delay: 0,
            },
            {
              num: "02",
              title: isIt ? "Spedizione Italia" : "Italy Shipping",
              desc: isIt
                ? "Consegna in tutta Italia con BRT, GLS o Poste Italiane."
                : "Delivery across Italy via BRT, GLS or Poste Italiane.",
              delay: 120,
            },
            {
              num: "03",
              title: isIt ? "Negozio Fisico" : "Physical Shop",
              desc: isIt
                ? "Visita il nostro negozio itinerante in Italia. Controlla il calendario."
                : "Visit our traveling shop in Italy. Check the calendar below.",
              delay: 240,
            },
          ].map(({ num, title, desc, delay }, idx) => (
            <ScrollReveal
              key={num}
              delay={delay}
              className={`px-6 py-10 md:py-14 flex flex-col gap-4 ${
                idx < 2 ? "border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800" : ""
              } ${idx === 0 ? "md:pl-0" : ""} ${idx === 2 ? "md:pr-0" : ""}`}
            >
              <span className="font-display text-6xl font-light leading-none text-stone-200 dark:text-stone-800">
                {num}
              </span>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900 dark:text-stone-100">
                {title}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{desc}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <section id="dove-siamo" className="max-w-6xl mx-auto px-6 py-20 w-full">
        <ScrollReveal>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#2d6a4f]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#2d6a4f]">
                  {isIt ? "Vieni a trovarci" : "Come visit us"}
                </p>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-light text-stone-900 dark:text-stone-100 leading-tight">
                {t("location.title")}
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                {isIt
                  ? "Seleziona una data per vedere dove si trova il negozio."
                  : "Select a date to see where the shop is located."}
              </p>
            </div>
            <ShopLocationWidget markedDates={markedDates} />
          </div>
        </ScrollReveal>
      </section>

    </main>
  );
}
