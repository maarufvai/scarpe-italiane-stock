"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  nameIt: string;
  nameEn: string;
  brand: string;
  sale: number;
  images: { url: string }[];
  variants: { price: number }[];
};

export function NewArrivalsSlider({
  products,
  locale,
  isIt,
}: {
  products: Product[];
  locale: string;
  isIt: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 280;
    el.scrollBy({ left: dir === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-stone-50 dark:bg-stone-950 border-y border-stone-200 dark:border-stone-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-amber-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
                {isIt ? "Appena arrivati" : "Just landed"}
              </p>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-stone-900 dark:text-stone-100 leading-tight">
              {isIt ? "Nuovi arrivi" : "New arrivals"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/scarpe?sort=newest`}
              className="text-sm text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors underline underline-offset-4"
            >
              {isIt ? "Vedi tutti" : "View all"}
            </Link>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="ml-2 w-10 h-10 rounded-full border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-stone-900 dark:hover:border-stone-100 transition-colors flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-stone-900 dark:hover:border-stone-100 transition-colors flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-2 px-2 no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((p) => {
            const name = (locale === "en" ? p.nameEn : p.nameIt) || p.nameIt || p.nameEn;
            const img = p.images[0]?.url ?? null;
            const minPrice = p.variants.length
              ? Math.min(...p.variants.map((v) => v.price))
              : 0;
            const onSale = p.sale > 0 && p.sale < minPrice;
            const salePrice = onSale ? minPrice - p.sale : minPrice;

            return (
              <Link
                key={p.id}
                href={`/${locale}/scarpe/${p.slug}`}
                className="group flex flex-col gap-2 shrink-0 snap-start w-[240px] sm:w-[280px]"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      sizes="280px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-stone-300" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full">
                    {isIt ? "Nuovo" : "New"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 px-0.5">
                  <p className="text-xs text-stone-400 font-medium">{p.brand}</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight line-clamp-1">
                    {name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="text-base font-bold text-amber-600">
                      €{(salePrice / 100).toFixed(2)}
                    </p>
                    {onSale && (
                      <p className="text-xs text-stone-400 line-through">
                        €{(minPrice / 100).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
