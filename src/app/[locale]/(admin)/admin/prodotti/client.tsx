"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, FileSpreadsheet } from "lucide-react";
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
  brand: string; category: string; season?: string | null; sale?: number; barcode?: string | null;
  images: ProductImage[]; variants: Variant[];
  createdAt: Date;
};

export function ProductsClient({ products: initial }: { products: Product[] }) {
  const locale = useAdminLocale();
  const t = adminT[locale];
  const [products, setProducts] = useState(initial);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showExcel, setShowExcel] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteProduct(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((p) => p.filter((x) => x.id !== id));
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

  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);
  const totalQty = products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + v.qty, 0), 0);

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

      {/* Table */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white p-16 flex flex-col items-center gap-3 text-stone-400">
          <Package className="w-10 h-10 opacity-40" />
          <p className="text-sm">{t.noProducts}</p>
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
              {products.map((p) => {
                const img = p.images[0]?.url;
                const liveVariants = p.variants.filter((v) => v.status === "LIVE" && v.qty > 0).length;
                const totalStock = p.variants.reduce((s, v) => s + v.qty, 0);
                const minPrice = p.variants.length
                  ? Math.min(...p.variants.map((v) => v.price))
                  : null;

                return (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {img ? (
                            <Image src={img} alt={p.nameIt} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate">{p.nameIt}</p>
                          <p className="text-xs text-stone-400 truncate">{p.category}</p>
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
                        <span className="text-stone-700">{p.variants.length}</span>
                        {minPrice !== null && (
                          <span className="text-xs text-stone-400">
                            {t.from} €{(minPrice / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
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
