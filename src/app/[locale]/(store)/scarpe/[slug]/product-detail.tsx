"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, Package, CheckCircle } from "lucide-react";
import { useCart } from "@/lib/cart-store";

type Variant = {
  id: string; size: string; color: string; colorCode: string | null;
  price: number; qty: number; status: string;
};
type Product = {
  id: string; slug: string; nameIt: string; nameEn: string;
  descIt: string | null; descEn: string | null;
  brand: string; category: string;
  images: { id: string; url: string }[];
  variants: Variant[];
};

const labels = {
  it: {
    back: "Tutti i prodotti", size: "Taglia", color: "Colore",
    addToCart: "Aggiungi al carrello", added: "Aggiunto!",
    outOfStock: "Esaurito", selectSize: "Seleziona una taglia",
    vatNote: "IVA 22% inclusa nel prezzo",
    available: "Disponibile", unavailable: "Non disponibile",
    pieces: "pz disponibili",
  },
  en: {
    back: "All products", size: "Size", color: "Color",
    addToCart: "Add to cart", added: "Added!",
    outOfStock: "Out of stock", selectSize: "Select a size",
    vatNote: "VAT 22% included in price",
    available: "Available", unavailable: "Unavailable",
    pieces: "pcs available",
  },
} as const;

export function ProductDetail({ product: p, locale }: { product: Product; locale: string }) {
  const t = labels[locale as "it" | "en"] ?? labels.it;
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.openCart);

  const name = locale === "en" ? p.nameEn : p.nameIt;
  const desc = locale === "en" ? p.descEn : p.descIt;

  // Unique sizes from LIVE variants with stock
  const liveVariants = p.variants.filter((v) => v.status === "LIVE" && v.qty > 0);
  const allSizes = [...new Set(p.variants.filter(v => v.status === "LIVE").map((v) => v.size))];
  const allColors = [...new Set(liveVariants.map((v) => v.color))];

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    allColors.length === 1 ? allColors[0] : null
  );
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const selectedVariant = selectedSize && selectedColor
    ? p.variants.find((v) => v.size === selectedSize && v.color === selectedColor)
    : null;

  const colorsForSize = selectedSize
    ? [...new Set(liveVariants.filter((v) => v.size === selectedSize).map((v) => v.color))]
    : allColors;

  const sizesForColor = selectedColor
    ? [...new Set(liveVariants.filter((v) => v.color === selectedColor).map((v) => v.size))]
    : allSizes;

  function handleAddToCart() {
    if (!selectedVariant) return;
    add({
      variantId: selectedVariant.id,
      productId: p.id,
      slug: p.slug,
      nameIt: p.nameIt,
      nameEn: p.nameEn,
      brand: p.brand,
      imageUrl: p.images[0]?.url ?? null,
      size: selectedVariant.size,
      color: selectedVariant.color,
      colorCode: selectedVariant.colorCode,
      priceCents: selectedVariant.price,
      stock: selectedVariant.qty,
    });
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const canAdd = !!selectedVariant && selectedVariant.qty > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back */}
      <Link href={`/${locale}/scarpe`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4" />
        {t.back}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            {p.images.length > 0 ? (
              <Image
                src={p.images[activeImg]?.url ?? p.images[0].url}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-stone-300" />
              </div>
            )}
          </div>
          {p.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {p.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    i === activeImg ? "border-stone-900" : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest">{p.brand}</p>
            <h1 className="text-3xl font-bold text-stone-900 mt-1 leading-tight">{name}</h1>
            <p className="text-xs text-stone-400 mt-1">{p.category}</p>
          </div>

          {/* Price */}
          <div>
            <p className="text-3xl font-bold text-stone-900">
              {selectedVariant
                ? `€${(selectedVariant.price / 100).toFixed(2)}`
                : `da €${(Math.min(...liveVariants.map(v => v.price)) / 100).toFixed(2)}`}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">{t.vatNote}</p>
          </div>

          {/* Color picker */}
          {allColors.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-stone-700">
                {t.color}
                {selectedColor && <span className="font-normal text-stone-400 ml-2">{selectedColor}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {allColors.map((color) => {
                  const variant = p.variants.find((v) => v.color === color);
                  const isAvail = colorsForSize.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!isAvail}
                      title={color}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        selectedColor === color
                          ? "border-stone-900 bg-stone-900 text-white"
                          : isAvail
                          ? "border-stone-200 hover:border-stone-400 text-stone-600"
                          : "border-stone-100 text-stone-300 cursor-not-allowed"
                      }`}
                    >
                      {variant?.colorCode && (
                        <span className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: variant.colorCode }} />
                      )}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size picker */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-stone-700">{t.size}</p>
            <div className="flex gap-2 flex-wrap">
              {allSizes.map((size) => {
                const isAvail = sizesForColor.includes(size);
                const variant = p.variants.find(
                  (v) => v.size === size && (selectedColor ? v.color === selectedColor : true)
                );
                const inStock = isAvail && (variant?.qty ?? 0) > 0;

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!inStock}
                    className={`w-12 h-12 rounded-xl border text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? "border-stone-900 bg-stone-900 text-white"
                        : inStock
                        ? "border-stone-200 hover:border-stone-900 text-stone-700"
                        : "border-stone-100 text-stone-300 cursor-not-allowed line-through"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock hint */}
          {selectedVariant && (
            <p className={`text-xs font-medium ${selectedVariant.qty <= 2 ? "text-amber-600" : "text-emerald-600"}`}>
              {selectedVariant.qty <= 2
                ? `⚠ Solo ${selectedVariant.qty} ${t.pieces}`
                : `✓ ${t.available} (${selectedVariant.qty} ${t.pieces})`}
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base transition-all ${
              added
                ? "bg-emerald-600 text-white"
                : canAdd
                ? "bg-stone-900 hover:bg-stone-700 text-white"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
          >
            {added ? (
              <><CheckCircle className="w-5 h-5" /> {t.added}</>
            ) : canAdd ? (
              <><ShoppingBag className="w-5 h-5" /> {t.addToCart}</>
            ) : !selectedSize ? (
              t.selectSize
            ) : (
              t.outOfStock
            )}
          </button>

          {/* Description */}
          {desc && (
            <div className="border-t border-stone-100 pt-5">
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
