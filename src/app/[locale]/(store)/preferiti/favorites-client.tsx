"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Package, X } from "lucide-react";
import { useFavorites } from "@/lib/favorites-store";

type Variant = { size: string; color: string; colorCode: string | null; price: number };
type Product = {
  id: string;
  slug: string;
  nameIt: string;
  nameEn: string;
  brand: string;
  sale: number;
  images: { url: string }[];
  variants: Variant[];
};

export function FavoritesClient({
  products,
  locale,
}: {
  products: Product[];
  locale: string;
}) {
  const isIt = locale === "it";
  const ids = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const clear = useFavorites((s) => s.clear);

  const favorites = useMemo(
    () => products.filter((p) => ids.includes(p.id)),
    [products, ids]
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            {isIt ? "Preferiti" : "Favorites"}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {favorites.length} {isIt ? "articoli" : "items"}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
          >
            <X className="w-3.5 h-3.5" /> {isIt ? "Rimuovi tutti" : "Clear all"}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-stone-400">
          <Heart className="w-12 h-12 opacity-30" />
          <p className="text-sm">
            {isIt ? "Nessun preferito ancora." : "No favorites yet."}
          </p>
          <Link
            href={`/${locale}/scarpe`}
            className="mt-2 text-sm font-medium text-stone-900 dark:text-stone-100 underline underline-offset-2"
          >
            {isIt ? "Sfoglia le scarpe" : "Browse shoes"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((p) => {
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
                className="group flex flex-col gap-2"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-stone-300" />
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={isIt ? "Rimuovi dai preferiti" : "Remove from favorites"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(p.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center backdrop-blur-sm"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 px-0.5">
                  <p className="text-sm text-stone-400 font-medium">{p.brand}</p>
                  <p className="text-base font-semibold text-stone-900 dark:text-stone-100 leading-tight line-clamp-2">
                    {name}
                  </p>
                  <p className="text-lg font-bold text-amber-600">
                    €{(salePrice / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
