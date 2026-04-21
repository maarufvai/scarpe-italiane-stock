"use client";

import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { Product } from "./client";
import type { adminT } from "@/lib/use-admin-locale";

type T = typeof adminT["it"] | typeof adminT["en"];
type ImportResult = { success: number; failed: number; products: Product[] };

export function ExcelImportDialog({
  t,
  onClose,
  onImported,
}: {
  t: T;
  onClose: () => void;
  onImported: (products: Product[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/import-excel", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-900">{t.importTitle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Format info */}
          <div className="bg-stone-50 rounded-xl p-4 text-xs text-stone-600 flex flex-col gap-2">
            <p className="font-semibold text-stone-800">{t.importCols}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
              <span className="text-emerald-700">name_it</span><span>Nome italiano</span>
              <span className="text-emerald-700">name_en</span><span>Nome inglese</span>
              <span className="text-emerald-700">brand</span><span>Marchio</span>
              <span className="text-emerald-700">category</span><span>Categoria</span>
              <span className="text-emerald-700">size</span><span>Taglia</span>
              <span className="text-emerald-700">color</span><span>Colore</span>
              <span className="text-emerald-700">price</span><span>Prezzo (€)</span>
              <span className="text-emerald-700">qty</span><span>Quantità</span>
              <span className="text-stone-400">barcode</span><span className="text-stone-400">Opzionale</span>
            </div>
            <p className="text-stone-400 mt-1">{t.importNote}</p>
          </div>

          {/* Drop zone */}
          {!result && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex flex-col items-center gap-3 border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-8 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 text-stone-400 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-8 h-8 text-stone-400" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-stone-700">
                  {loading ? t.importLoading : t.importClick}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">.xlsx, .xls, .csv</p>
              </div>
            </button>
          )}

          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t.importSuccess(result.success)}</p>
                  {result.failed > 0 && <p className="text-amber-700 mt-0.5">{t.importFailed(result.failed)}</p>}
                </div>
              </div>
              <button
                onClick={() => onImported(result.products)}
                className="bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {t.importClose}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
