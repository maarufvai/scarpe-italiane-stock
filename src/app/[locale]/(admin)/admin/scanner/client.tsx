"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ScanBarcode, CheckCircle, XCircle, Loader2, RotateCcw, Plus, Minus, RefreshCw } from "lucide-react";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorCode: string | null;
  qty: number;
};

type ScannedProduct = {
  id: string;
  nameIt: string;
  barcode: string | null;
  image: string | null;
  variants: Variant[];
};

type Flash = { type: "success" | "error"; message: string };

const labels = {
  it: {
    title: "Scanner barcode",
    scanning: "In attesa di scansione...",
    manualLabel: "Inserisci codice manualmente",
    manualPlaceholder: "EAN / codice a barre",
    search: "Cerca",
    notFound: "Prodotto non trovato",
    camError: "Fotocamera non disponibile — usa inserimento manuale",
    startCam: "Attiva fotocamera",
    stopCam: "Ferma fotocamera",
    variants: "Varianti",
    qty: "pz",
    outOfStock: "ESAURITO",
    newScan: "Nuova scansione",
    updated: "Scorta aggiornata",
    resetLabel: "Reimposta",
    resetPlaceholder: "Quantità",
    confirm: "✓",
  },
  en: {
    title: "Barcode scanner",
    scanning: "Waiting for scan...",
    manualLabel: "Enter code manually",
    manualPlaceholder: "EAN / barcode",
    search: "Search",
    notFound: "Product not found",
    camError: "Camera unavailable — use manual entry",
    startCam: "Start camera",
    stopCam: "Stop camera",
    variants: "Variants",
    qty: "pcs",
    outOfStock: "OUT OF STOCK",
    newScan: "New scan",
    updated: "Stock updated",
    resetLabel: "Reset",
    resetPlaceholder: "Quantity",
    confirm: "✓",
  },
} as const;

export function ScannerClient() {
  const [locale] = useState<"it" | "en">(() =>
    typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "it"
  );
  const l = labels[locale];

  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const originalQtys = useRef<Record<string, number>>({});
  const [flash, setFlash] = useState<Flash | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // variantId currently updating
  const [resetting, setResetting] = useState<string | null>(null); // variantId showing reset input
  const [resetVal, setResetVal] = useState("");
  const [manual, setManual] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<{ stop: () => void } | null>(null);

  async function lookup(barcode: string) {
    if (!barcode.trim()) return;
    setLoading(true);
    setProduct(null);
    try {
      const res = await fetch("/api/scanner/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: barcode.trim() }),
      });
      if (res.status === 404) {
        setFlash({ type: "error", message: l.notFound });
      } else if (res.ok) {
        const data: ScannedProduct = await res.json();
        originalQtys.current = Object.fromEntries(data.variants.map((v) => [v.id, v.qty]));
        setProduct(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(variantId: string, action: "increment" | "decrement" | "set", qty?: number) {
    setBusy(variantId);
    try {
      const res = await fetch("/api/scanner/variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, action, qty }),
      });
      if (res.ok) {
        const { qty: newQty } = await res.json();
        setProduct((p) =>
          p ? { ...p, variants: p.variants.map((v) => v.id === variantId ? { ...v, qty: newQty } : v) } : p
        );
        setFlash({ type: "success", message: l.updated });
      }
    } finally {
      setBusy(null);
    }
  }

  function openReset(variantId: string) {
    setResetting(variantId);
    setResetVal((originalQtys.current[variantId] ?? 0).toString());
  }

  function confirmReset(variantId: string) {
    const parsed = parseInt(resetVal);
    if (!isNaN(parsed) && parsed >= 0) {
      updateQty(variantId, "set", parsed);
    }
    setResetting(null);
    setResetVal("");
  }

  const handleScan = useCallback(async (barcode: string) => {
    setCameraOn(false);
    await lookup(barcode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 2000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  useEffect(() => {
    if (!cameraOn) return;
    let stopped = false;

    async function startCamera() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        if (!videoRef.current) return;
        const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current);
        if (!stopped && result) await handleScan(result.getText());
        readerRef.current = reader as unknown as { stop: () => void };
      } catch {
        if (!stopped) setCamError(l.camError);
      }
    }

    startCamera();
    return () => {
      stopped = true;
      if (readerRef.current) readerRef.current.stop();
    };
  }, [cameraOn, handleScan, l.camError]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <ScanBarcode className="w-6 h-6 text-stone-700" />
        <h1 className="text-2xl font-bold text-stone-900">{l.title}</h1>
      </div>

      {flash && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          flash.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {flash.type === "success"
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {flash.message}
        </div>
      )}

      {/* Camera */}
      {!product && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.scanning}</p>
            <button
              onClick={() => setCameraOn((v) => !v)}
              className="text-xs font-medium bg-stone-900 hover:bg-stone-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {cameraOn ? l.stopCam : l.startCam}
            </button>
          </div>
          {cameraOn && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          )}
          {camError && <p className="text-xs text-red-500">{camError}</p>}
        </div>
      )}

      {/* Manual entry */}
      {!product && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.manualLabel}</p>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { lookup(manual); setManual(""); } }}
              placeholder={l.manualPlaceholder}
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
            />
            <button
              onClick={() => { lookup(manual); setManual(""); }}
              disabled={!manual || loading}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : l.search}
            </button>
          </div>
        </div>
      )}

      {/* Product + variants */}
      {product && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {/* Product header */}
          <div className="flex items-center gap-4 p-5 border-b border-stone-100">
            {product.image && (
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                <Image src={product.image} alt={product.nameIt} width={56} height={56} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-900 truncate">{product.nameIt}</p>
              {product.barcode && <p className="text-xs text-stone-400 font-mono mt-0.5">{product.barcode}</p>}
            </div>
            <button
              onClick={() => setProduct(null)}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {l.newScan}
            </button>
          </div>

          {/* Variants */}
          <div className="p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">{l.variants}</p>
            {product.variants.map((v) => (
              <div key={v.id} className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
                {/* Row: color dot + name + qty badge */}
                <div className="flex items-center gap-3">
                  {v.colorCode && (
                    <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0" style={{ background: v.colorCode }} />
                  )}
                  <span className="text-sm font-medium text-stone-800 flex-1">{v.size} / {v.color}</span>
                  {v.qty <= 0
                    ? <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">{l.outOfStock}</span>
                    : <span className="text-sm font-semibold text-stone-700">{v.qty} {l.qty}</span>
                  }
                </div>

                {/* Controls row */}
                {resetting === v.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={resetVal}
                      onChange={(e) => setResetVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmReset(v.id); if (e.key === "Escape") setResetting(null); }}
                      autoFocus
                      placeholder={l.resetPlaceholder}
                      className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                    />
                    <button
                      onClick={() => confirmReset(v.id)}
                      className="px-3 py-1.5 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors"
                    >
                      {l.confirm}
                    </button>
                    <button
                      onClick={() => setResetting(null)}
                      className="px-3 py-1.5 bg-stone-100 text-stone-600 text-sm rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateQty(v.id, "decrement")}
                      disabled={busy === v.id || v.qty <= 0}
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 bg-white hover:bg-red-50 hover:border-red-200 text-stone-600 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {busy === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => updateQty(v.id, "increment")}
                      disabled={busy === v.id}
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-stone-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-stone-600 hover:text-emerald-600 transition-colors disabled:opacity-40"
                    >
                      {busy === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openReset(v.id)}
                      disabled={busy === v.id}
                      className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 text-xs transition-colors disabled:opacity-40 ml-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {l.resetLabel}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
