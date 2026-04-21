"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";

type ShopLocation = {
  id: string;
  date: string;
  address: string;
  lat: number | null;
  lng: number | null;
  noteIt: string | null;
  noteEn: string | null;
};

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

export function ShopLocationWidget({
  markedDates,
}: {
  markedDates: string[];
}) {
  const t = useTranslations("location");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  // Normalize to local midnight so toISOString() matches react-day-picker's date objects
  const [selected, setSelected] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [location, setLocation] = useState<ShopLocation | null | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchLocation(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchLocation(date: Date) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/shop-location?date=${toDateString(date)}`
      );
      const data = await res.json();
      setLocation(data);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setSelected(date);
    fetchLocation(date);
  }

  const marked = new Set(markedDates.map((d) => toDateString(new Date(d))));

  const note = locale === "it" ? location?.noteIt : location?.noteEn;
  const mapsUrl = location
    ? location.lat && location.lng
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`
    : null;
  const embedUrl = location?.lat && location?.lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.005},${location.lat - 0.005},${location.lng + 0.005},${location.lat + 0.005}&layer=mapnik&marker=${location.lat},${location.lng}`
    : location
    ? `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(location.address)}&layer=mapnik`
    : null;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Calendar — client-only to avoid data-day locale mismatch */}
      <div className="rounded-xl border bg-white dark:bg-stone-800 dark:border-stone-700 shadow-sm p-2">
        {mounted ? (
          <>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              modifiers={{ marked: (d) => marked.has(toDateString(d)) }}
              modifiersClassNames={{
                marked: "bg-emerald-100 text-emerald-800 font-semibold rounded-full",
              }}
              initialFocus
            />
            <p className="text-xs text-zinc-400 dark:text-stone-500 text-center pb-2">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-200 mr-1 align-middle" />
              {locale === "it" ? "Sede disponibile" : "Location available"}
            </p>
          </>
        ) : (
          <div className="w-[280px] h-[300px]" />
        )}
      </div>

      {/* Location card */}
      <div className="flex-1 min-h-[240px] flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-400 dark:text-stone-500 pt-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t("select_date")}</span>
          </div>
        ) : location ? (
          <>
            <div className="rounded-xl border bg-white dark:bg-stone-800 dark:border-stone-700 shadow-sm p-4 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-stone-100">{location.address}</p>
                  {note && (
                    <p className="text-sm text-zinc-500 dark:text-stone-400 mt-1">{note}</p>
                  )}
                </div>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors mt-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("open_maps")}
                </a>
              )}
            </div>

            {/* Map embed */}
            {embedUrl && (
              <div className="rounded-xl overflow-hidden border shadow-sm h-52 lg:h-64">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="shop location map"
                />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed bg-zinc-50 dark:bg-stone-900 dark:border-stone-700 p-6 flex items-center justify-center text-zinc-400 dark:text-stone-500 text-sm">
            {t("no_location")}
          </div>
        )}
      </div>
    </div>
  );
}
