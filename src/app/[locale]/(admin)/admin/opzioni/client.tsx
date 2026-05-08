"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

type Item = { id: string; name: string };
type ColorItem = { id: string; name: string; hex: string };

function OptionsPanel({
  title,
  subtitle,
  items,
  onAdd,
  onDelete,
  withColor,
}: {
  title: string;
  subtitle: string;
  items: (Item | ColorItem)[];
  onAdd: (name: string, hex?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  withColor?: boolean;
}) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    await onAdd(name.trim(), withColor ? hex : undefined);
    setName("");
    setHex("#000000");
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-stone-900 dark:border-stone-700 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-stone-100">{title}</h2>
        <p className="text-xs text-zinc-400 dark:text-stone-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Add row */}
      <div className="flex gap-2">
        {withColor && (
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-10 w-10 rounded-lg border border-stone-200 dark:border-stone-600 cursor-pointer shrink-0"
          />
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={withColor ? "Nome colore / Color name" : "Nome / Name"}
          className="flex-1 rounded-lg border border-stone-200 dark:border-stone-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-stone-900 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300 text-white text-sm font-medium px-3 py-2 disabled:opacity-50 transition-colors shrink-0"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Aggiungi
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-stone-500 text-center py-4">Nessun elemento. Aggiungine uno.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-stone-100 dark:divide-stone-700">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              {"hex" in item && (
                <span
                  className="w-5 h-5 rounded-full border border-stone-200 dark:border-stone-600 shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
              )}
              <span className="flex-1 text-sm text-zinc-800 dark:text-stone-100">{item.name}</span>
              {"hex" in item && (
                <span className="text-xs font-mono text-zinc-400 dark:text-stone-500">{item.hex}</span>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-300 dark:text-stone-600 hover:text-red-500 transition-colors disabled:opacity-40"
              >
                {deletingId === item.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OpzioniClient({
  brands: initialBrands,
  categories: initialCategories,
  colors: initialColors,
  genders: initialGenders,
}: {
  brands: Item[];
  categories: Item[];
  colors: ColorItem[];
  genders: Item[];
}) {
  const [brands, setBrands] = useState<Item[]>(initialBrands);
  const [categories, setCategories] = useState<Item[]>(initialCategories);
  const [colors, setColors] = useState<ColorItem[]>(initialColors);
  const [genders, setGenders] = useState<Item[]>(initialGenders);

  async function addBrand(name: string) {
    const res = await fetch("/api/admin/brands", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.id) setBrands((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function deleteBrand(id: string) {
    await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }

  async function addCategory(name: string) {
    const res = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.id) setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function addColor(name: string, hex?: string) {
    const res = await fetch("/api/admin/colors", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hex: hex ?? "#000000" }),
    });
    const data = await res.json();
    if (data.id) setColors((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function deleteColor(id: string) {
    await fetch(`/api/admin/colors/${id}`, { method: "DELETE" });
    setColors((prev) => prev.filter((c) => c.id !== id));
  }

  async function addGender(name: string) {
    const res = await fetch("/api/admin/genders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.id) setGenders((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function deleteGender(id: string) {
    await fetch(`/api/admin/genders/${id}`, { method: "DELETE" });
    setGenders((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-stone-100">Opzioni / Options</h1>
      <p className="text-sm text-zinc-500 dark:text-stone-400 -mt-4">
        Gestisci brand, categorie e colori disponibili nella scheda prodotto e nei filtri del negozio.
      </p>

      <OptionsPanel
        title="Brand"
        subtitle="Brand disponibili nella scheda prodotto e filtri shop."
        items={brands}
        onAdd={addBrand}
        onDelete={deleteBrand}
      />

      <OptionsPanel
        title="Categorie / Categories"
        subtitle="Categorie disponibili nella scheda prodotto e filtri shop."
        items={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />

      <OptionsPanel
        title="Colori / Colors"
        subtitle="Colori con codice hex. Selezionabili nelle varianti prodotto e filtri shop."
        items={colors}
        onAdd={addColor}
        onDelete={deleteColor}
        withColor
      />

      <OptionsPanel
        title="Genere / Gender"
        subtitle="Generi disponibili nella scheda prodotto e filtri shop (es. Uomini, Donne, Bambini)."
        items={genders}
        onAdd={addGender}
        onDelete={deleteGender}
      />
    </div>
  );
}
