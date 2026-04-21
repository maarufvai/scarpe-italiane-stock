"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Trash2, Save, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(
  () => import("@/components/map-picker").then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="h-[370px] rounded-xl bg-stone-100 animate-pulse" /> }
);

type ShopLocation = {
  id: string;
  date: Date;
  address: string;
  lat: number | null;
  lng: number | null;
  noteIt: string | null;
  noteEn: string | null;
};

function toDateString(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

export function AdminLocationClient({
  locations: initial,
}: {
  locations: ShopLocation[];
}) {
  const t = useTranslations("admin");
  const [locations, setLocations] = useState(initial);
  const [selected, setSelected] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [form, setForm] = useState({
    address: "",
    lat: "",
    lng: "",
    noteIt: "",
    noteEn: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const markedSet = new Set(locations.map((l) => toDateString(l.date)));

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setSelected(date);
    const existing = locations.find(
      (l) => toDateString(l.date) === toDateString(date)
    );
    if (existing) {
      setForm({
        address: existing.address,
        lat: existing.lat?.toString() ?? "",
        lng: existing.lng?.toString() ?? "",
        noteIt: existing.noteIt ?? "",
        noteEn: existing.noteEn ?? "",
      });
    } else {
      setForm({ address: "", lat: "", lng: "", noteIt: "", noteEn: "" });
    }
  }

  async function save() {
    if (!form.address.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shop-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: toDateString(selected),
          address: form.address,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          noteIt: form.noteIt || null,
          noteEn: form.noteEn || null,
        }),
      });
      const saved = await res.json();
      setLocations((prev) => {
        const filtered = prev.filter(
          (l) => toDateString(l.date) !== toDateString(selected)
        );
        return [...filtered, saved].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await fetch(
        `/api/admin/shop-location?date=${toDateString(selected)}`,
        { method: "DELETE" }
      );
      setLocations((prev) =>
        prev.filter((l) => toDateString(l.date) !== toDateString(selected))
      );
      setForm({ address: "", lat: "", lng: "", noteIt: "", noteEn: "" });
    } finally {
      setDeleting(false);
    }
  }

  const hasExisting = markedSet.has(toDateString(selected));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-zinc-900">{t("location")}</h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Calendar */}
        <div className="rounded-xl border bg-white shadow-sm p-2 shrink-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            modifiers={{ marked: (d) => markedSet.has(toDateString(d)) }}
            modifiersClassNames={{
              marked: "bg-emerald-100 text-emerald-800 font-semibold rounded-full",
            }}
          />
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="rounded-xl border bg-white shadow-sm p-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-zinc-500">
              {selected.toLocaleDateString("it-IT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700">
                {t("location_address")} *
              </span>
              <MapPicker
                key={toDateString(selected)}
                initialLat={form.lat ? parseFloat(form.lat) : null}
                initialLng={form.lng ? parseFloat(form.lng) : null}
                onPick={({ lat, lng, address }) =>
                  setForm((f) => ({
                    ...f,
                    lat: lat.toFixed(6),
                    lng: lng.toFixed(6),
                    address: address,
                  }))
                }
              />
              {/* Editable address fallback */}
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Via Roma 1, 20121 Milano MI"
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
              />
              {form.lat && form.lng && (
                <p className="text-[11px] text-stone-400">
                  {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}
                </p>
              )}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700">
                {t("location_note_it")}
              </span>
              <input
                value={form.noteIt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, noteIt: e.target.value }))
                }
                placeholder="Mercato settimanale"
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700">
                {t("location_note_en")}
              </span>
              <input
                value={form.noteEn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, noteEn: e.target.value }))
                }
                placeholder="Weekly market"
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </label>

            <div className="flex gap-3 pt-1">
              <button
                onClick={save}
                disabled={saving || !form.address.trim()}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {t("location_save")}
              </button>

              {hasExisting && (
                <button
                  onClick={remove}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {t("location_delete")}
                </button>
              )}
            </div>
          </div>

          {/* Upcoming locations list */}
          {locations.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Sedi salvate
              </p>
              <ul className="flex flex-col divide-y">
                {locations.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-zinc-50 rounded px-1 transition-colors"
                    onClick={() => handleSelect(new Date(l.date))}
                  >
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {l.address}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(l.date).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
