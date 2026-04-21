"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  nameIt: string;
  nameEn: string;
  brand: string;
  imageUrl: string | null;
  size: string;
  color: string;
  colorCode: string | null;
  priceCents: number;
  qty: number;
  stock: number; // known stock at time of add — used to cap qty before validation
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (variantId: string) => void;
  updateQty: (variantId: string, qty: number, max?: number) => void;
  clear: () => void;
};

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      add: (item) =>
        set((state) => {
          const cap = item.stock;
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            const newQty = Math.min(existing.qty + (item.qty ?? 1), cap);
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, qty: newQty, stock: cap } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, qty: Math.min(item.qty ?? 1, cap) }],
          };
        }),

      remove: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQty: (variantId, qty, max) =>
        set((state) => {
          const item = state.items.find((i) => i.variantId === variantId);
          const cap = max ?? item?.stock ?? Infinity;
          const capped = Math.min(qty, cap);
          return {
            items:
              capped <= 0
                ? state.items.filter((i) => i.variantId !== variantId)
                : state.items.map((i) =>
                    i.variantId === variantId ? { ...i, qty: capped } : i
                  ),
          };
        }),

      clear: () => set({ items: [] }),
    }),
    { name: "scarpe-cart", partialize: (s) => ({ items: s.items }) }
  )
);

export function cartTotals(items: CartItem[]) {
  const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
  const vatCents = Math.round(subtotalCents * 0.22);
  const totalCents = subtotalCents + vatCents;
  return { subtotalCents, vatCents, totalCents };
}
