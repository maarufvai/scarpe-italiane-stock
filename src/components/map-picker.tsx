"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

export type MapPin = { lat: number; lng: number; address: string };

interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
  onPick: (pin: MapPin) => void;
}

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

export function MapPicker({ initialLat, initialLng, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    async function init() {
      const L = (await import("leaflet")).default;

      // Fix default marker icons broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const startLat = initialLat ?? 41.9028;
      const startLng = initialLng ?? 12.4964;
      const startZoom = initialLat ? 15 : 13;

      const map = L.map(containerRef.current!).setView([startLat, startLng], startZoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Place initial marker if coords exist
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng]).addTo(map);
      }

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        placeMarker(L, map, lat, lng);
        const address = await reverseGeocode(lat, lng);
        onPick({ lat, lng, address });
      });
    }

    init();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarker(L: typeof import("leaflet"), map: import("leaflet").Map, lat: number, lng: number) {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }
  }

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "it" } }
      );
      const data = await res.json();
      return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } finally {
      setGeocoding(false);
    }
  }

  async function searchAddress() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=it`,
        { headers: { "Accept-Language": "it" } }
      );
      const results = await res.json();
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  }

  async function pickResult(r: { display_name: string; lat: string; lon: string }) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setSearchResults([]);
    setQuery(r.display_name);

    const L = (await import("leaflet")).default;
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
      placeMarker(L, mapRef.current, lat, lng);
    }
    onPick({ lat, lng, address: r.display_name });
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search box */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchAddress()}
            placeholder="Cerca indirizzo... (es. Via Roma 1, Milano)"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
          />
          <button
            onClick={searchAddress}
            disabled={searching || !query.trim()}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium px-3 py-2.5 rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[1000] mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => pickResult(r)}
                className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-stone-50 transition-colors text-left text-sm text-stone-700 border-b border-stone-100 last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {geocoding && (
        <p className="text-xs text-stone-400 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Ricerca indirizzo...
        </p>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-stone-200" style={{ height: 320 }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 z-[999] bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-stone-500 pointer-events-none">
          Clicca sulla mappa per posizionare il pin
        </div>
      </div>
    </div>
  );
}
