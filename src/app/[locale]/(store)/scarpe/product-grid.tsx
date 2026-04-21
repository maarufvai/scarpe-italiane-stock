"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, SlidersHorizontal, X } from "lucide-react";

type Variant = { size: string; color: string; colorCode: string | null; price: number };
type Product = {
  id: string; slug: string; nameIt: string; nameEn: string;
  brand: string; category: string; season: string | null; sale: number;
  images: { url: string }[];
  variants: Variant[];
};

const SEASONS = [
  { value: "SUMMER", it: "Estate", en: "Summer" },
  { value: "WINTER", it: "Inverno", en: "Winter" },
  { value: "RAINY",  it: "Pioggia", en: "Rainy"  },
] as const;

const t = {
  it: {
    title: "Shop", items: "articoli", filters: "Filtri",
    clearAll: "Azzera filtri", price: "Prezzo", season: "Stagione",
    color: "Colore", size: "Taglia", allSeasons: "Tutte",
    noProducts: "Nessun prodotto trovato.",
    onSale: "In saldo", onSaleOnly: "Solo in saldo",
  },
  en: {
    title: "Shop", items: "items", filters: "Filters",
    clearAll: "Clear filters", price: "Price", season: "Season",
    color: "Color", size: "Size", allSeasons: "All",
    noProducts: "No products found.",
    onSale: "On sale", onSaleOnly: "On sale only",
  },
} as const;

export function ProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  const l = locale === "en" ? t.en : t.it;

  // Derive filter options from products
  const allPrices = products.flatMap((p) => p.variants.map((v) => v.price));
  const globalMin = allPrices.length ? Math.min(...allPrices) : 0;
  const globalMax = allPrices.length ? Math.max(...allPrices) : 100000;

  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.variants.map((v) => v.size)))].sort((a, b) => parseFloat(a) - parseFloat(b)),
    [products]
  );
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) =>
      p.variants.forEach((v) => { if (v.colorCode) map.set(v.colorCode, v.color); })
    );
    return [...map.entries()].map(([code, name]) => ({ code, name }));
  }, [products]);

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([globalMin, globalMax]);
  const [season, setSeason] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasFilters = season || selectedColors.length || selectedSizes.length || onSaleOnly ||
    priceRange[0] > globalMin || priceRange[1] < globalMax;

  function clearAll() {
    setPriceRange([globalMin, globalMax]);
    setSeason("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setOnSaleOnly(false);
  }

  function toggleColor(code: string) {
    setSelectedColors((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  }
  function toggleSize(size: string) {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  const filtered = useMemo(() => products.filter((p) => {
    if (onSaleOnly && p.sale <= 0) return false;
    if (season && p.season !== season) return false;
    const variantPrices = p.variants.map((v) => v.price);
    const minP = Math.min(...variantPrices);
    if (minP < priceRange[0] || minP > priceRange[1]) return false;
    if (selectedColors.length) {
      const pColors = new Set(p.variants.map((v) => v.colorCode).filter(Boolean));
      if (!selectedColors.some((c) => pColors.has(c))) return false;
    }
    if (selectedSizes.length) {
      const pSizes = new Set(p.variants.map((v) => v.size));
      if (!selectedSizes.some((s) => pSizes.has(s))) return false;
    }
    return true;
  }), [products, season, priceRange, selectedColors, selectedSizes, onSaleOnly]);

  const sidebar = (
    <div className="flex flex-col gap-6">
      {/* Price */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.price}</p>
        <DualRangeSlider
          min={globalMin} max={globalMax}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>

      {/* Season */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.season}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSeason("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !season ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 border-stone-900 dark:border-amber-500" : "border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            {l.allSeasons}
          </button>
          {SEASONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSeason(season === s.value ? "" : s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                season === s.value ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 border-stone-900 dark:border-amber-500" : "border-stone-200 text-stone-600 hover:border-stone-400"
              }`}
            >
              {locale === "en" ? s.en : s.it}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      {allColors.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.color}</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map(({ code, name }) => (
              <button
                key={code}
                onClick={() => toggleColor(code)}
                title={name}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  selectedColors.includes(code)
                    ? "border-stone-900 dark:border-amber-400 scale-110 shadow-md opacity-100"
                    : "border-stone-200 opacity-40 hover:opacity-70 hover:border-stone-400"
                }`}
                style={{ backgroundColor: code }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {allSizes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.size}</p>
          <div className="flex flex-wrap gap-1.5">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`w-10 h-10 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedSizes.includes(size)
                    ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 border-stone-900 dark:border-amber-500"
                    : "border-stone-200 text-stone-600 hover:border-stone-400 bg-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* On sale */}
      <button
        onClick={() => setOnSaleOnly((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
          onSaleOnly
            ? "bg-red-500 border-red-500 text-white"
            : "border-stone-200 text-stone-600 hover:border-stone-400 bg-white"
        }`}
      >
        <span>🏷</span>
        {l.onSaleOnly}
      </button>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
        >
          <X className="w-3.5 h-3.5" /> {l.clearAll}
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full px-6 py-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{l.title}</h1>
          <p className="text-sm text-stone-400 mt-1">{filtered.length} {l.items}</p>
        </div>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center gap-2 border border-stone-200 bg-white hover:bg-stone-50 px-4 py-2 rounded-xl text-sm font-medium text-stone-600 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {l.filters}
          {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          {sidebar}
        </aside>

        {/* Grid */}
        <main className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-stone-400">
              <Package className="w-10 h-10 opacity-40" />
              <p className="text-sm">{l.noProducts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-stone-900">{l.filters}</p>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            {sidebar}
          </div>
        </>
      )}
    </div>
  );
}

function DualRangeSlider({ min, max, value, onChange }: {
  min: number; max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"lo" | "hi" | null>(null);
  const pctLo = ((lo - min) / (max - min)) * 100;
  const pctHi = ((hi - min) / (max - min)) * 100;

  function valueFromPointer(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round((min + pct * (max - min)) / 100) * 100; // snap to €1
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const v = valueFromPointer(e.clientX);
    dragging.current = Math.abs(v - lo) <= Math.abs(v - hi) ? "lo" : "hi";
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const v = valueFromPointer(e.clientX);
    if (dragging.current === "lo") onChange([Math.min(v, hi), hi]);
    else onChange([lo, Math.max(v, lo)]);
  }

  function onPointerUp() { dragging.current = null; }

  // Manual inputs
  function setLo(raw: string) {
    const v = Math.round(parseFloat(raw) * 100);
    if (!isNaN(v) && v >= min && v <= hi) onChange([v, hi]);
  }
  function setHi(raw: string) {
    const v = Math.round(parseFloat(raw) * 100);
    if (!isNaN(v) && v <= max && v >= lo) onChange([lo, v]);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="absolute w-full h-1.5 rounded-full bg-stone-200">
          <div className="absolute h-full rounded-full bg-stone-900"
            style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }} />
        </div>
        <div className="absolute w-4 h-4 rounded-full bg-stone-900 border-2 border-white shadow"
          style={{ left: `calc(${pctLo}% - 8px)` }} />
        <div className="absolute w-4 h-4 rounded-full bg-stone-900 border-2 border-white shadow"
          style={{ left: `calc(${pctHi}% - 8px)` }} />
      </div>

      {/* Manual inputs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-1">
          <span className="text-xs text-stone-400">€</span>
          <input
            type="number" min={min / 100} max={hi / 100} step="1"
            defaultValue={(lo / 100).toFixed(0)}
            key={lo}
            onBlur={(e) => setLo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setLo((e.target as HTMLInputElement).value)}
            className="w-full rounded-lg border border-stone-200 px-2 py-1 text-xs bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
        <span className="text-xs text-stone-300">—</span>
        <div className="flex items-center gap-1 flex-1">
          <span className="text-xs text-stone-400">€</span>
          <input
            type="number" min={lo / 100} max={max / 100} step="1"
            defaultValue={(hi / 100).toFixed(0)}
            key={hi}
            onBlur={(e) => setHi(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setHi((e.target as HTMLInputElement).value)}
            className="w-full rounded-lg border border-stone-200 px-2 py-1 text-xs bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product: p, locale }: { product: Product; locale: string }) {
  const name = locale === "en" ? p.nameEn : p.nameIt;
  const img = p.images[0]?.url ?? null;
  const minPrice = Math.min(...p.variants.map((v) => v.price));
  const sizes = [...new Set(p.variants.map((v) => v.size))];
  const colors = [...new Set(p.variants.map((v) => v.colorCode).filter(Boolean))];
  const seasonLabel = p.season
    ? SEASONS.find((s) => s.value === p.season)?.[locale === "en" ? "en" : "it"]
    : null;
  const onSale = p.sale > 0 && p.sale < minPrice;
  const salePrice = onSale ? minPrice - p.sale : minPrice;
  const salePct = onSale ? Math.round((p.sale / minPrice) * 100) : 0;

  return (
    <Link href={`/${locale}/scarpe/${p.slug}`} className="group flex flex-col gap-2">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
        {img ? (
          <Image src={img} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-stone-300" />
          </div>
        )}
        {/* Sale badge — top right */}
        {onSale && (
          <span className="absolute top-2 right-2 text-[11px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow">
            -{salePct}%
          </span>
        )}
        {seasonLabel && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 text-stone-700 px-2 py-0.5 rounded-full">
            {seasonLabel}
          </span>
        )}
        {colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {colors.slice(0, 4).map((c) => (
              <span key={c} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c! }} />
            ))}
            {colors.length > 4 && (
              <span className="w-3.5 h-3.5 rounded-full bg-stone-200 border border-white text-[8px] flex items-center justify-center text-stone-500">
                +{colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <p className="text-sm text-stone-400 font-medium">{p.brand}</p>
        <p className="text-base font-semibold text-stone-900 leading-tight group-hover:text-amber-700 transition-colors line-clamp-2">{name}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-lg font-bold text-amber-600">€{(salePrice / 100).toFixed(2)}</p>
          {onSale && (
            <p className="text-sm text-stone-400 line-through">€{(minPrice / 100).toFixed(2)}</p>
          )}
        </div>
        {sizes.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {sizes.slice(0, 4).map((s) => (
              <span key={s} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-medium">{s}</span>
            ))}
            {sizes.length > 4 && (
              <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded">+{sizes.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
