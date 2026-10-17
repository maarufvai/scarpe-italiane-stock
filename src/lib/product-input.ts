import { NextResponse } from "next/server";

// Server-side validation for the admin product create/edit payload.
// Prices and sale are in cents; the client converts from euros before sending.

const SEASONS = ["SUMMER", "WINTER", "RAINY"];

export type VariantInput = {
  id?: string;
  size: string;
  color: string;
  colorCode: string | null;
  price: number;
  qty: number;
};

export type ProductInput = {
  nameIt: string;
  nameEn: string;
  descIt: string | null;
  descEn: string | null;
  brand: string;
  categories: string[];
  genders: string[];
  season: string | null;
  sale: number;
  barcode: string | null;
  variants: VariantInput[];
  images: string[];
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim()) : [];
const isNonNegInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

export function parseProductInput(body: unknown): { data: ProductInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };
  const b = body as Record<string, unknown>;

  let nameIt = str(b.nameIt);
  let nameEn = str(b.nameEn);
  // Mirror name across locales if only one provided
  if (nameIt && !nameEn) nameEn = nameIt;
  else if (nameEn && !nameIt) nameIt = nameEn;
  if (!nameIt) return { error: "Nome obbligatorio / Name is required" };

  const season = str(b.season) || null;
  if (season && !SEASONS.includes(season)) return { error: "Stagione non valida / Invalid season" };

  const sale = b.sale ?? 0;
  if (!isNonNegInt(sale)) return { error: "Sconto non valido / Invalid sale amount" };

  if (!Array.isArray(b.variants) || b.variants.length === 0) {
    return { error: "Almeno una variante richiesta / At least one variant required" };
  }

  const variants: VariantInput[] = [];
  const seen = new Set<string>();
  for (const raw of b.variants as Record<string, unknown>[]) {
    const size = str(raw?.size);
    const color = str(raw?.color);
    if (!size) return { error: "Taglia obbligatoria per ogni variante / Size is required for every variant" };
    if (!isNonNegInt(raw.price) || raw.price === 0) {
      return { error: "Prezzo non valido / Invalid price" };
    }
    if (!isNonNegInt(raw.qty)) return { error: `Quantità non valida per taglia ${size} / Invalid quantity for size ${size}` };
    const key = `${size.toLowerCase()}|${color.toLowerCase()}`;
    if (seen.has(key)) {
      return { error: `Variante duplicata: ${size} ${color} / Duplicate variant: ${size} ${color}` };
    }
    seen.add(key);
    variants.push({
      id: typeof raw.id === "string" && raw.id ? raw.id : undefined,
      size,
      color,
      colorCode: str(raw.colorCode) || null,
      price: raw.price,
      qty: raw.qty,
    });
  }

  const minPrice = Math.min(...variants.map((v) => v.price));
  if (sale >= minPrice) return { error: "Lo sconto supera il prezzo / Sale must be less than the price" };

  return {
    data: {
      nameIt,
      nameEn,
      descIt: str(b.descIt) || null,
      descEn: str(b.descEn) || null,
      brand: str(b.brand),
      categories: strList(b.categories),
      genders: strList(b.genders),
      season,
      sale,
      barcode: str(b.barcode) || null,
      variants,
      images: strList(b.images),
    },
  };
}

// Turn known Prisma errors into a message the admin can act on.
export function prismaErrorResponse(e: unknown) {
  const err = e as { code?: string; meta?: unknown };
  if (err?.code === "P2002") {
    // Field names live in meta.target, or deeper under driver adapters — search it all.
    const target = JSON.stringify(err.meta ?? "");
    if (target.includes("barcode")) {
      return NextResponse.json({ error: "Barcode già usato da un altro prodotto / Barcode already used by another product" }, { status: 409 });
    }
    if (target.includes("size")) {
      return NextResponse.json({ error: "Variante duplicata (taglia + colore) / Duplicate variant (size + color)" }, { status: 409 });
    }
    return NextResponse.json({ error: "Valore duplicato / Duplicate value" }, { status: 409 });
  }
  if (err?.code === "P2003") {
    return NextResponse.json(
      { error: "Impossibile rimuovere una variante con ordini: imposta la quantità a 0 / Can't remove a variant that has orders: set its quantity to 0 instead" },
      { status: 409 }
    );
  }
  if (err?.code === "P2025") {
    return NextResponse.json({ error: "Prodotto non trovato / Product not found" }, { status: 404 });
  }
  console.error(e);
  return NextResponse.json({ error: "Errore del server / Server error" }, { status: 500 });
}
