"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Plus, Trash2, Loader2, Upload, ImageIcon } from "lucide-react";
import type { Product } from "./client";
import type { adminT } from "@/lib/use-admin-locale";

type T = typeof adminT["it"] | typeof adminT["en"];

type VariantForm = {
  id?: string; size: string; color: string; colorCode: string; qty: string;
};

function emptyVariant(): VariantForm {
  return { size: "", color: "", colorCode: "#000000", qty: "1" };
}

export function ProductDialog({
  product,
  t,
  onClose,
  onSaved,
}: {
  product: Product | null;
  t: T;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    nameIt: product?.nameIt ?? "",
    nameEn: product?.nameEn ?? "",
    descIt: product?.descIt ?? "",
    descEn: product?.descEn ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    season: (product as { season?: string })?.season ?? "",
    sale: (((product as { sale?: number })?.sale ?? 0) / 100).toFixed(2),
    barcode: (product as { barcode?: string | null })?.barcode ?? "",
    price: product?.variants[0] ? (product.variants[0].price / 100).toFixed(2) : "",
  });
  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorCode: v.colorCode ?? "#000000",
      qty: v.qty.toString(),
    })) ?? [emptyVariant()]
  );
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function setField(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setVariantField(i: number, k: keyof VariantForm, v: string) {
    setVariants((vs) => vs.map((vr, idx) => idx === i ? { ...vr, [k]: v } : vr));
  }

  async function uploadImages(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  async function save() {
    if (!form.nameIt || !form.nameEn || !form.brand || !form.category || !form.price) return;
    setSaving(true);

    const payload = {
      ...form,
      sale: Math.round(parseFloat(form.sale) * 100) || 0,
      barcode: form.barcode || null,
      variants: variants
        .filter((v) => v.size && v.color)
        .map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorCode: v.colorCode || null,
          price: Math.round(parseFloat(form.price) * 100),
          qty: parseInt(v.qty) || 0,
        })),
      images,
    };

    const res = await fetch(
      isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      // For PATCH, re-fetch full product to get updated variants+images
      if (isEdit) {
        const all = await fetch("/api/admin/products");
        const allData = await all.json();
        const updated = allData.find((p: Product) => p.id === product.id);
        if (updated) onSaved(updated);
        else onSaved(await res.json());
      } else {
        onSaved(await res.json());
      }
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-stone-900">
            {isEdit ? t.editProduct : t.newProduct}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Basic info */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.info}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.nameIt} value={form.nameIt} onChange={(v) => setField("nameIt", v)} placeholder="Mocassino artigianale" />
              <Field label={t.nameEn} value={form.nameEn} onChange={(v) => setField("nameEn", v)} placeholder="Artisan loafer" />
              <Field label={t.brand_label} value={form.brand} onChange={(v) => setField("brand", v)} placeholder="Gucci" />
              <Field label={t.category} value={form.category} onChange={(v) => setField("category", v)} placeholder="Mocassini" />
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">{t.price} (€)</span>
                <input
                  type="number" step="0.01" min="0"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="99.00"
                  className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 w-full"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">Stagione / Season</span>
                <select
                  value={form.season}
                  onChange={(e) => setField("season", e.target.value)}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">—</option>
                  <option value="SUMMER">Estate / Summer</option>
                  <option value="WINTER">Inverno / Winter</option>
                  <option value="RAINY">Pioggia / Rainy</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">Sconto / Sale (€)</span>
                <input
                  type="number" min="0" step="0.01"
                  value={form.sale}
                  onChange={(e) => setField("sale", e.target.value)}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
              <Field label="Barcode (EAN)" value={form.barcode} onChange={(v) => setField("barcode", v)} placeholder="1234567890123" />
            </div>
            <Field label={t.descIt} value={form.descIt} onChange={(v) => setField("descIt", v)} multiline placeholder="Descrizione in italiano..." />
            <Field label={t.descEn} value={form.descEn} onChange={(v) => setField("descEn", v)} multiline placeholder="English description..." />
          </section>

          {/* Images */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.images}</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 group">
                  <Image src={url} alt="" width={80} height={80} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-200 hover:border-stone-400 flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span className="text-[10px]">{uploading ? "..." : t.upload}</span>
              </button>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => e.target.files && uploadImages(e.target.files)} />
            {images.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <ImageIcon className="w-3.5 h-3.5" />
                {t.noImages}
              </div>
            )}
          </section>

          {/* Variants */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.variantsLabel}</h3>
              <button
                onClick={() => setVariants((vs) => [...vs, emptyVariant()])}
                className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t.addVariant}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-8 gap-2 items-end p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="col-span-2">
                    <label className="text-[10px] font-medium text-stone-500 block mb-1">{t.size}</label>
                    <input value={v.size} onChange={(e) => setVariantField(i, "size", e.target.value)}
                      placeholder="42" className="input-sm w-full" />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] font-medium text-stone-500 block mb-1">{t.color}</label>
                    <input value={v.color} onChange={(e) => setVariantField(i, "color", e.target.value)}
                      placeholder="Nero" className="input-sm w-full" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-medium text-stone-500 block mb-1">{t.hex}</label>
                    <input type="color" value={v.colorCode}
                      onChange={(e) => setVariantField(i, "colorCode", e.target.value)}
                      className="h-8 w-full rounded cursor-pointer border border-stone-200" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-medium text-stone-500 block mb-1">{t.qty}</label>
                    <input value={v.qty} onChange={(e) => setVariantField(i, "qty", e.target.value)}
                      type="number" min="0" placeholder="1" className="input-sm w-full" />
                  </div>
                    <div className="col-span-1 flex justify-end">
                    <button onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                      disabled={variants.length === 1}
                      className="p-1.5 rounded hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors disabled:opacity-30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors">
            {t.cancel}
          </button>
          <button
            onClick={save}
            disabled={saving || !form.nameIt || !form.nameEn || !form.brand || !form.category || !form.price}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? t.save : t.create}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean;
}) {
  const cls = "rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 w-full";
  return (
    <label className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
      <span className="text-xs font-medium text-stone-600">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={3} className={cls + " resize-none"} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}
