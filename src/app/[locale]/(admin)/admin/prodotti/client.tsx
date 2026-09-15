"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, FileSpreadsheet, Search, X } from "lucide-react";
import { ProductDialog } from "./product-dialog";
import { ExcelImportDialog } from "./excel-import-dialog";
import { useAdminLocale, adminT } from "@/lib/use-admin-locale";

type Variant = {
  id: string; size: string; color: string; colorCode: string | null;
  price: number; qty: number; status: string;
};
type ProductImage = { id: string; url: string; position: number };
export type Product = {
  id: string; slug: string; nameIt: string; nameEn: string;
  descIt: string | null; descEn: string | null;
  brand: string; categories: string[]; genders: string[]; season?: string | null; sale?: number; barcode?: string | null;
  images: ProductImage[]; variants: Variant[];
  createdAt: Date;
};

function uniqueSorted(values: string[], numeric = false) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    numeric && !isNaN(parseFloat(a)) && !isNaN(parseFloat(b))
      ? parseFloat(a) - parseFloat(b)
      : a.localeCompare(b)
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-amber-50 text-amber-700 border-amber-300"
          : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
      }`}
    >
      {children}
    </button>
  );
}

export function ProductsClient({
  products: initial,
  brands,
  categories,
  colors,
  genders,
}: {
  products: Product[];
  brands: string[];
  categories: string[];
  colors: { name: string; hex: string }[];
  genders: string[];
}) {
  const locale = useAdminLocale();
  const t = adminT[locale];
  const [products, setProducts] = useState(initial);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showExcel, setShowExcel] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  async function deleteProduct(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setDeleteError(body.error ?? `Error ${res.status}`);
      } else {
        setProducts((p) => p.filter((x) => x.id !== id));
      }
    } catch {
      setDeleteError("Network error");
    }
    setDeleting(null);
  }

  function onSaved(product: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [product, ...prev];
    });
    setShowAdd(false);
    setEditProduct(null);
  }

  function clearFilters() {
    setQuery("");
    setSizeFilter([]);
    setGenderFilter([]);
    setCategoryFilter("");
    setBrandFilter("");
  }

  // Only offer values that actually exist on products, so every option returns something.
  const sizeOptions = useMemo(() => uniqueSorted(products.flatMap((p) => p.variants.map((v) => v.size)), true), [products]);
  const genderOptions = useMemo(() => uniqueSorted(products.flatMap((p) => p.genders)), [products]);
  const categoryOptions = useMemo(() => uniqueSorted(products.flatMap((p) => p.categories)), [products]);
  const brandOptions = useMemo(() => uniqueSorted(products.map((p) => p.brand)), [products]);

  // Each row keeps only the variants matching the size filter, so stock counts answer
  // questions like "how many size 26 do I have?".
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.flatMap((product) => {
      if (q && ![product.nameIt, product.nameEn, product.brand, product.barcode ?? ""].some((s) => s.toLowerCase().includes(q))) return [];
      if (categoryFilter && !product.categories.includes(categoryFilter)) return [];
      if (brandFilter && product.brand !== brandFilter) return [];
      if (genderFilter.length && !product.genders.some((g) => genderFilter.includes(g))) return [];
      const variants = sizeFilter.length ? product.variants.filter((v) => sizeFilter.includes(v.size)) : product.variants;
      if (sizeFilter.length && variants.length === 0) return [];
      return [{ product, variants }];
    });
  }, [products, query, sizeFilter, genderFilter, categoryFilter, brandFilter]);

  const filtersActive = Boolean(query.trim() || sizeFilter.length || genderFilter.length || categoryFilter || brandFilter);

  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);
  const totalQty = products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + v.qty, 0), 0);
  const matchedVariants = rows.reduce((s, r) => s + r.variants.length, 0);
  const matchedQty = rows.reduce((s, r) => s + r.variants.reduce((vs, v) => vs + v.qty, 0), 0);

  const selectClass =
    "rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400";

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t.products}</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {products.length} {t.products.toLowerCase()} · {totalVariants} {t.variants.toLowerCase()} · {totalQty} {t.pcs}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExcel(true)}
            className="flex items-center gap-2 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t.importExcel}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.addProduct}
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {locale === "en" ? "Delete failed" : "Eliminazione fallita"}: {deleteError}
        </div>
      )}

      {/* Filters */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchProducts}
                className={`${selectClass} w-full pl-9`}
              />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
              <option value="">{t.allCategories}</option>
              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className={selectClass}>
              <option value="">{t.allBrands}</option>
              {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {sizeOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide w-16 shrink-0">{t.size}</span>
              {sizeOptions.map((s) => (
                <Chip key={s} active={sizeFilter.includes(s)} onClick={() => setSizeFilter((f) => toggle(f, s))}>{s}</Chip>
              ))}
            </div>
          )}

          {genderOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide w-16 shrink-0">{t.filterGender}</span>
              {genderOptions.map((g) => (
                <Chip key={g} active={genderFilter.includes(g)} onClick={() => setGenderFilter((f) => toggle(f, g))}>{g}</Chip>
              ))}
            </div>
          )}

          {filtersActive && (
            <div className="flex items-center justify-between gap-3 flex-wrap border-t border-stone-100 pt-3">
              <p className="text-sm text-stone-600">
                <span className="text-lg font-bold text-stone-900">{matchedQty} {t.pcs}</span>{" "}
                · {rows.length} {t.products.toLowerCase()} · {matchedVariants} {t.variants.toLowerCase()}
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
                {t.clearFilters}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white p-16 flex flex-col items-center gap-3 text-stone-400">
          <Package className="w-10 h-10 opacity-40" />
          <p className="text-sm">{t.noProducts}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white p-16 flex flex-col items-center gap-3 text-stone-400">
          <Search className="w-10 h-10 opacity-40" />
          <p className="text-sm">{t.noMatches}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t.products}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">{t.brand}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Barcode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">{t.variants}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">{t.stock}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(({ product: p, variants }) => {
                const img = p.images[0]?.url;
                const totalStock = variants.reduce((s, v) => s + v.qty, 0);
                const minPrice = variants.length
                  ? Math.min(...variants.map((v) => v.price))
                  : null;

                return (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {img ? (
                            <Image src={img} alt={p.nameIt} width={192} height={192} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate">{p.nameIt}</p>
                          <p className="text-xs text-stone-400 truncate">{p.categories.join(", ")}</p>
                          {p.genders.length > 0 && (
                            <p className="text-xs text-stone-400 truncate">{p.genders.join(", ")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 hidden sm:table-cell">{p.brand}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.barcode
                        ? <span className="font-mono text-xs text-stone-500">{p.barcode}</span>
                        : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-700">{variants.length}</span>
                        {minPrice !== null && (
                          <span className="text-xs text-stone-400">
                            {t.from} €{(minPrice / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {t.size} {uniqueSorted(variants.map((v) => v.size), true).join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        totalStock === 0 ? "bg-red-50 text-red-600" :
                        totalStock <= 3 ? "bg-amber-50 text-amber-700" :
                        "bg-emerald-50 text-emerald-700"
                      }`}>
                        {totalStock} {t.pcs}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(showAdd || editProduct) && (
        <ProductDialog
          product={editProduct}
          t={t}
          brands={brands}
          categories={categories}
          colors={colors}
          genders={genders}
          onClose={() => { setShowAdd(false); setEditProduct(null); }}
          onSaved={onSaved}
        />
      )}

      {showExcel && (
        <ExcelImportDialog
          t={t}
          onClose={() => setShowExcel(false)}
          onImported={(imported) => {
            setProducts((prev) => [...imported, ...prev]);
            setShowExcel(false);
          }}
        />
      )}
    </div>
  );
}
