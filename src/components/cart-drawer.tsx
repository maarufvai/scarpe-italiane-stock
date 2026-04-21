"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { X, Trash2, Plus, Minus, Package, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";

const t = {
  it: {
    title: "Carrello",
    empty: "Il carrello è vuoto",
    browsing: "Scopri le nostre scarpe",
    subtotal: "Subtotale",
    vat: "IVA 22%",
    total: "Totale",
    checkout: "Procedi al pagamento",
    vatNote: "IVA inclusa nel totale",
    outOfStock: "Esaurito",
    onlyX: (n: number) => `Solo ${n} disponibile`,
    resolveIssues: "Risolvi i problemi per procedere",
  },
  en: {
    title: "Cart",
    empty: "Your cart is empty",
    browsing: "Browse our shoes",
    subtotal: "Subtotal",
    vat: "VAT 22%",
    total: "Total",
    checkout: "Proceed to checkout",
    vatNote: "VAT included in total",
    outOfStock: "Out of stock",
    onlyX: (n: number) => `Only ${n} available`,
    resolveIssues: "Resolve issues to proceed",
  },
} as const;

type StockMap = Record<string, number>; // variantId → available qty

export function CartDrawer() {
  const locale = useLocale() as "it" | "en";
  const l = t[locale] ?? t.it;
  const { items, isOpen, closeCart, remove, updateQty } = useCart();
  const { subtotalCents, vatCents, totalCents } = cartTotals(items);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [stockMap, setStockMap] = useState<StockMap>({});

  const validate = useCallback(async () => {
    if (items.length === 0) return;
    try {
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })) }),
      });
      const { results } = await res.json() as { results: { variantId: string; available: number }[] };
      const map: StockMap = {};
      for (const r of results) map[r.variantId] = r.available;
      setStockMap(map);
    } catch { /* ignore network errors */ }
  }, [items]);

  // Validate whenever drawer opens
  useEffect(() => {
    if (isOpen) validate();
  }, [isOpen, validate]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasIssues = items.some((item) => {
    const avail = stockMap[item.variantId];
    return avail !== undefined && item.qty > avail;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#faf9f7] shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label={l.title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-stone-700" />
            <h2 className="font-bold text-stone-900">{l.title}</h2>
            {items.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold flex items-center justify-center">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-stone-400">
              <ShoppingBag className="w-12 h-12 opacity-25" />
              <p className="font-medium">{l.empty}</p>
              <Link
                href={`/${locale}/scarpe`}
                onClick={closeCart}
                className="text-sm text-stone-600 underline underline-offset-2 hover:text-stone-900 transition-colors"
              >
                {l.browsing}
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const name = locale === "en" ? item.nameEn : item.nameIt;
              const available = stockMap[item.variantId];
              const isOutOfStock = available !== undefined && available === 0;
              const isOverStock = available !== undefined && item.qty > available && available > 0;
              const hasIssue = isOutOfStock || isOverStock;
              const maxQty = available !== undefined ? available : item.stock;

              return (
                <div
                  key={item.variantId}
                  className={`flex gap-3 bg-white rounded-2xl border p-3 ${
                    hasIssue ? "border-amber-300 bg-amber-50/50" : "border-stone-200"
                  }`}
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-100 shrink-0 relative">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-stone-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="text-[10px] text-stone-400 font-medium">{item.brand}</p>
                    <Link
                      href={`/${locale}/scarpe/${item.slug}`}
                      onClick={closeCart}
                      className="text-xs font-semibold text-stone-900 hover:text-amber-700 transition-colors leading-snug"
                    >
                      {name}
                    </Link>
                    <p className="text-[10px] text-stone-400">{item.size} / {item.color}</p>

                    {/* Stock warning */}
                    {isOutOfStock && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="text-[10px] font-semibold text-red-600">{l.outOfStock}</span>
                      </div>
                    )}
                    {isOverStock && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="text-[10px] font-semibold text-amber-700">{l.onlyX(available)}</span>
                      </div>
                    )}

                    <p className="text-sm font-bold text-stone-900 mt-1">
                      €{(item.priceCents * item.qty / 100).toFixed(2)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <button
                      onClick={() => remove(item.variantId)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-0.5 border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.variantId, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-stone-900">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.variantId, item.qty + 1, maxQty)}
                        disabled={item.qty >= maxQty}
                        className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 transition-colors text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-5 flex flex-col gap-3 bg-[#faf9f7]">
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>{l.subtotal}</span>
                <span>€{(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-xs">
                <span>{l.vat}</span>
                <span>€{(vatCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-2 mt-1">
                <span>{l.total}</span>
                <span>€{(totalCents / 100).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400">{l.vatNote}</p>

            {hasIssues ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-amber-800">{l.resolveIssues}</span>
              </div>
            ) : (
              <Link
                href={`/${locale}/checkout`}
                onClick={closeCart}
                className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                {l.checkout}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
