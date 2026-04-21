"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";

const t = {
  it: {
    title: "Carrello", empty: "Il tuo carrello è vuoto.",
    continueShopping: "Continua lo shopping",
    size: "Taglia", color: "Colore",
    subtotal: "Subtotale", vat: "IVA (22%)", total: "Totale",
    checkout: "Procedi al pagamento",
    vatNote: "IVA 22% inclusa nel totale",
  },
  en: {
    title: "Cart", empty: "Your cart is empty.",
    continueShopping: "Continue shopping",
    size: "Size", color: "Color",
    subtotal: "Subtotal", vat: "VAT (22%)", total: "Total",
    checkout: "Proceed to checkout",
    vatNote: "VAT 22% included in total",
  },
} as const;

export default function CartPage() {
  const locale = useLocale() as "it" | "en";
  const l = t[locale] ?? t.it;
  const { items, remove, updateQty } = useCart();
  const { subtotalCents, vatCents, totalCents } = cartTotals(items);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center gap-5 text-stone-400">
        <ShoppingBag className="w-14 h-14 opacity-30" />
        <p className="text-lg font-medium">{l.empty}</p>
        <Link
          href={`/${locale}/scarpe`}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors"
        >
          {l.continueShopping}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">{l.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map((item) => {
            const name = locale === "en" ? item.nameEn : item.nameIt;
            return (
              <div key={item.variantId}
                className="flex gap-4 bg-white rounded-2xl border border-stone-200 p-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={name} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-xs text-stone-400 font-medium">{item.brand}</p>
                  <Link href={`/${locale}/scarpe/${item.slug}`}
                    className="text-sm font-semibold text-stone-900 hover:text-amber-700 transition-colors truncate">
                    {name}
                  </Link>
                  <div className="flex gap-3 text-xs text-stone-500">
                    <span>{l.size}: <strong>{item.size}</strong></span>
                    <span className="flex items-center gap-1">
                      {l.color}:
                      {item.colorCode && (
                        <span className="w-3 h-3 rounded-full border border-stone-300 inline-block"
                          style={{ backgroundColor: item.colorCode }} />
                      )}
                      <strong>{item.color}</strong>
                    </span>
                  </div>
                  <p className="text-sm font-bold text-stone-900 mt-auto">
                    €{(item.priceCents * item.qty / 100).toFixed(2)}
                  </p>
                </div>

                {/* Qty + remove */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button onClick={() => remove(item.variantId)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 border border-stone-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.variantId, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-stone-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.variantId, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4 sticky top-20">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>{l.subtotal}</span>
                <span>€{(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-xs">
                <span>{l.vat}</span>
                <span>€{(vatCents / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-900 text-base">
                <span>{l.total}</span>
                <span>€{(totalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-400">{l.vatNote}</p>

            <Link
              href={`/${locale}/checkout`}
              className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              {l.checkout}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href={`/${locale}/scarpe`}
              className="text-center text-sm text-stone-500 hover:text-stone-900 transition-colors">
              {l.continueShopping}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
