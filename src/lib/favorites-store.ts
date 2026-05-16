"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesStore = {
  ids: string[];
  toggle: (productId: string) => void;
  isFav: (productId: string) => boolean;
  clear: () => void;
};

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      isFav: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "scarpe-favorites" }
  )
);
