"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Trash2, Loader2, Upload, ImageIcon } from "lucide-react";
import type { Product } from "./client";
import type { adminT } from "@/lib/use-admin-locale";
import { shrinkImage } from "@/lib/shrink-image";

type T = typeof adminT["it"] | typeof adminT["en"];

// price is a per-variant override in euros; empty means "use the main price"
type VariantForm = {
  id?: string; size: string; color: string; colorCode: string; qty: string; price: string;
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function emptyVariant(): VariantForm {
  return { size: "", color: "", colorCode: "#000000", qty: "1", price: "" };
}

// "99,50" and "99.50" both → 9950 cents; null when not a valid amount
function euroToCents(value: string): number | null {
  const s = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}

export function ProductDialog({
  product,
  t,
  brands,
  categories,
  colors,
  genders,
  onClose,
  onSaved,
}: {
  product: Product | null;
  t: T;
  brands: string[];
  categories: string[];
  colors: { name: string; hex: string }[];
  genders: string[];
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const isEdit = !!product;
  const basePrice = product?.variants[0]?.price;
  const [form, setForm] = useState({
    nameIt: product?.nameIt ?? "",
    nameEn: product?.nameEn ?? "",
    descIt: product?.descIt ?? "",
    descEn: product?.descEn ?? "",
    brand: product?.brand ?? "",
    categories: product?.categories ?? [],
    genders: product?.genders ?? [],
    season: product?.season ?? "",
    sale: ((product?.sale ?? 0) / 100).toFixed(2),
    barcode: product?.barcode ?? "",
    price: basePrice !== undefined ? (basePrice / 100).toFixed(2) : "",
  });
  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorCode: v.colorCode ?? "#000000",
      qty: v.qty.toString(),
      // Keep variants that differ from the main price, so saving doesn't flatten them
      price: v.price !== basePrice ? (v.price / 100).toFixed(2) : "",
    })) ?? [emptyVariant()]
  );
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSizeErrors, setShowSizeErrors] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function requestClose() {
    if (dirty && !confirm("Uscire senza salvare? / Discard unsaved changes?")) return;
    onClose();
  }

  // Escape closes (with the same unsaved-changes guard)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (dirty && !confirm("Uscire senza salvare? / Discard unsaved changes?")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, onClose]);

  function setField(k: keyof typeof form, v: string) {
    setDirty(true);
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleCategory(name: string) {
    setDirty(true);
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(name)
        ? f.categories.filter((c) => c !== name)
        : [...f.categories, name],
    }));
  }

  function toggleGender(name: string) {
    setDirty(true);
    setForm((f) => ({
      ...f,
      genders: f.genders.includes(name)
        ? f.genders.filter((g) => g !== name)
        : [...f.genders, name],
    }));
  }

  function setVariantField(i: number, k: keyof VariantForm, v: string) {
    setDirty(true);
    setVariants((vs) => vs.map((vr, idx) => idx === i ? { ...vr, [k]: v } : vr));
  }

  async function uploadOne(original: File): Promise<string> {
    const file = await shrinkImage(original);
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name}: max 10 MB`);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      throw new Error(`${file.name}: ${data.error ?? (res.status === 413 ? "file too large" : `error ${res.status}`)}`);
    }
    return data.url;
  }

  async function uploadImages(files: File[]) {
    setUploading(true);
    setError(null);
    try {
      // Two at a time — decoding many full-size photos at once can run a phone out of memory
      const results: PromiseSettledResult<string>[] = new Array(files.length);
      let next = 0;
      const worker = async () => {
        while (next < files.length) {
          const i = next++;
          results[i] = await uploadOne(files[i]).then(
            (value) => ({ status: "fulfilled" as const, value }),
            (reason) => ({ status: "rejected" as const, reason })
          );
        }
      };
      await Promise.all([worker(), worker()]);
      const urls = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
      const failures = results.flatMap((r) => (r.status === "rejected" ? [(r.reason as Error).message] : []));
      if (urls.length) {
        setDirty(true);
        setImages((prev) => [...prev, ...urls]);
      }
      if (failures.length) setError(`Caricamento fallito / Upload failed — ${failures.join("; ")}`);
    } finally {
      setUploading(false);
    }
  }

  function validate(): string | null {
    if (!form.nameIt.trim() && !form.nameEn.trim()) return "Nome obbligatorio / Name is required";

    const mainPrice = euroToCents(form.price);
    if (mainPrice === null || mainPrice === 0) return "Prezzo non valido / Enter a valid price";

    const meaningful = variants.filter((v) => v.size.trim() || v.color || parseInt(v.qty) > 0);
    if (meaningful.length === 0) return "Almeno una variante richiesta / At least one variant required";
    if (meaningful.some((v) => !v.size.trim())) {
      setShowSizeErrors(true);
      return "Taglia obbligatoria per ogni variante / Size is required for every variant";
    }
    if (meaningful.some((v) => !/^\d+$/.test(v.qty.trim() || "0"))) {
      return "Quantità non valida / Invalid quantity";
    }
    if (meaningful.some((v) => v.price.trim() && !euroToCents(v.price))) {
      return "Prezzo variante non valido / Invalid variant price";
    }
    const keys = meaningful.map((v) => `${v.size.trim().toLowerCase()}|${v.color.toLowerCase()}`);
    if (new Set(keys).size !== keys.length) {
      return "Due varianti con stessa taglia e colore / Two variants have the same size and color";
    }

    const sale = euroToCents(form.sale || "0");
    if (sale === null) return "Sconto non valido / Invalid sale amount";
    const minPrice = Math.min(...meaningful.map((v) => euroToCents(v.price) || mainPrice));
    if (sale >= minPrice) return "Lo sconto supera il prezzo / Sale must be less than the price";
    return null;
  }

  async function save() {
    setError(null);
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    const mainPrice = euroToCents(form.price)!;
    const meaningful = variants.filter((v) => v.size.trim() || v.color || parseInt(v.qty) > 0);
    const payload = {
      ...form,
      sale: euroToCents(form.sale || "0") ?? 0,
      barcode: form.barcode.trim() || null,
      variants: meaningful.map((v) => ({
        id: v.id,
        size: v.size.trim(),
        color: v.color || "",
        colorCode: v.colorCode || null,
        price: euroToCents(v.price) || mainPrice,
        qty: parseInt(v.qty) || 0,
      })),
      images,
    };

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? `Errore / Error ${res.status}`);
        return;
      }
      onSaved(data);
    } catch {
      setError("Errore di rete, riprova / Network error, please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center sm:p-4">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-2xl h-dvh sm:h-auto sm:max-h-[90dvh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-stone-900">
            {isEdit ? t.editProduct : t.newProduct}
          </h2>
          <button onClick={requestClose} className="p-2 -mr-2 rounded-lg hover:bg-stone-100 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-6 flex-1">
          {/* Basic info */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.info}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.nameIt} value={form.nameIt} onChange={(v) => setField("nameIt", v)} placeholder="Mocassino artigianale" />
              <Field label={t.nameEn} value={form.nameEn} onChange={(v) => setField("nameEn", v)} placeholder="Artisan loafer" />
              <label className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-stone-600">{t.brand_label}</span>
                <select
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-base sm:text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
                >
                  <option value="">— seleziona / select —</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  {form.brand && !brands.includes(form.brand) && (
                    <option value={form.brand}>{form.brand} (custom)</option>
                  )}
                </select>
              </label>
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-stone-600">{t.category}</span>
                {categories.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Aggiungi categorie in Opzioni / Add categories in Options</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          form.categories.includes(c)
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-400 bg-stone-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <span className="text-xs font-medium text-stone-600">Genere / Gender</span>
                {genders.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Aggiungi generi in Opzioni / Add genders in Options</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {genders.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGender(g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          form.genders.includes(g)
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 text-stone-600 hover:border-stone-400 bg-stone-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">{t.price} (€) <span className="text-red-500">*</span></span>
                <input
                  type="text" inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="99,00"
                  className="rounded-lg border border-stone-200 px-3 py-2 text-base sm:text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 w-full"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">Stagione / Season</span>
                <select
                  value={form.season}
                  onChange={(e) => setField("season", e.target.value)}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-base sm:text-sm bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
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
                  type="text" inputMode="decimal"
                  value={form.sale}
                  onChange={(e) => setField("sale", e.target.value)}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-base sm:text-sm bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-stone-600">Barcode (EAN)</span>
                <input
                  inputMode="numeric"
                  value={form.barcode}
                  onChange={(e) => setField("barcode", e.target.value)}
                  placeholder="1234567890123"
                  className="rounded-lg border border-stone-200 px-3 py-2 text-base sm:text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 w-full"
                />
              </label>
            </div>
            <Field label={t.descIt} value={form.descIt} onChange={(v) => setField("descIt", v)} multiline placeholder="Descrizione in italiano..." />
            <Field label={t.descEn} value={form.descEn} onChange={(v) => setField("descEn", v)} multiline placeholder="English description..." />
          </section>

          {/* Images */}
          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.images}</h3>
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200">
                  <Image src={url} alt="" width={80} height={80} className="w-full h-full object-cover" />
                  {/* Always visible — touch screens have no hover */}
                  <button
                    type="button"
                    onClick={() => { setDirty(true); setImages((imgs) => imgs.filter((_, idx) => idx !== i)); }}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-200 hover:border-stone-400 flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span className="text-[10px]">{uploading ? "..." : t.upload}</span>
              </button>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = ""; // allow picking the same file again
                if (files.length) uploadImages(files);
              }} />
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
                type="button"
                onClick={() => { setDirty(true); setVariants((vs) => [...vs, emptyVariant()]); }}
                className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors py-2"
              >
                <Plus className="w-3.5 h-3.5" /> {t.addVariant}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {variants.map((v, i) => (
                <div key={v.id ?? `new-${i}`} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[11px] font-medium text-stone-500 block mb-1">
                      {t.size} <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={v.size}
                      onChange={(e) => { setVariantField(i, "size", e.target.value); if (showSizeErrors) setShowSizeErrors(false); }}
                      placeholder="42"
                      inputMode="decimal"
                      className={`input-sm w-full ${showSizeErrors && !v.size.trim() ? "border-red-400 ring-1 ring-red-300" : ""}`}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-5 order-last sm:order-none">
                    <label className="text-[11px] font-medium text-stone-500 block mb-1">{t.color}</label>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-6 h-6 rounded-full border border-stone-200 shrink-0"
                        style={{ backgroundColor: v.colorCode || "#ccc" }}
                      />
                      <select
                        value={v.color}
                        onChange={(e) => {
                          const selected = colors.find((c) => c.name === e.target.value);
                          setDirty(true);
                          setVariants((vs) => vs.map((vr, idx) =>
                            idx === i
                              ? { ...vr, color: e.target.value, colorCode: selected?.hex ?? vr.colorCode }
                              : vr
                          ));
                        }}
                        className="input-sm flex-1 min-w-0"
                      >
                        <option value="">— colore —</option>
                        {colors.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        {v.color && !colors.find((c) => c.name === v.color) && (
                          <option value={v.color}>{v.color} (custom)</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label className="text-[11px] font-medium text-stone-500 block mb-1">{t.qty}</label>
                    <input value={v.qty} onChange={(e) => setVariantField(i, "qty", e.target.value)}
                      type="number" min="0" inputMode="numeric" placeholder="1" className="input-sm w-full" />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[11px] font-medium text-stone-500 block mb-1">€</label>
                    <input value={v.price} onChange={(e) => setVariantField(i, "price", e.target.value)}
                      inputMode="decimal" placeholder={form.price || "—"} className="input-sm w-full"
                      title="Lascia vuoto per usare il prezzo principale / Leave empty to use the main price" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setDirty(true); setVariants((vs) => vs.filter((_, idx) => idx !== i)); }}
                      disabled={variants.length === 1}
                      aria-label="Remove variant"
                      className="p-2 -mr-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">
              € vuoto = prezzo principale / Empty € = main price
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-100 sticky bottom-0 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-1 min-w-0">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3 sm:ml-auto">
            <button type="button" onClick={requestClose} className="flex-1 sm:flex-none px-4 py-2.5 text-sm text-red-500 hover:text-red-700 transition-colors">
              {isEdit ? "Annulla / Cancel" : "Esci / Exit"}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? t.save : t.create}
            </button>
          </div>
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
  const cls = "rounded-lg border border-stone-200 px-3 py-2 text-base sm:text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 w-full";
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
