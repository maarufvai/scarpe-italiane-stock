import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import * as XLSX from "xlsx";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// Accepts 99, "99.50", "99,50", "€ 1.299,00" — Italian sheets often use a decimal comma.
function parseEuro(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) && raw > 0 ? Math.round(raw * 100) : null;
  let s = String(raw ?? "").replace(/[€\s]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", "."); // 1.299,00 → 1299.00
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // 1.299 → 1299
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Math.round(parseFloat(s) * 100);
  return n > 0 ? n : null;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File troppo grande (max 5 MB) / File too large (max 5 MB)" }, { status: 400 });
  }

  let rows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  } catch {
    return NextResponse.json({ error: "File non leggibile / Could not read file" }, { status: 400 });
  }

  // Normalise header keys to lowercase
  const normalised = rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]))
  );

  const errors: string[] = [];
  let failed = 0;

  // Group rows by best-available name + brand → one product per group.
  // Spreadsheet row numbers start at 2 (row 1 is the header).
  const groups = new Map<string, { row: (typeof normalised)[number]; line: number }[]>();
  normalised.forEach((row, i) => {
    const line = i + 2;
    const groupName = String(row.name_en ?? "").trim() || String(row.name_it ?? "").trim();
    const brand = String(row.brand ?? "").trim();
    if (!groupName && !brand && Object.values(row).every((v) => String(v).trim() === "")) return; // blank row
    if (!groupName || !brand) {
      failed++;
      errors.push(`Riga ${line}: nome o brand mancante / missing name or brand`);
      return;
    }
    const key = `${groupName.toLowerCase()}||${brand.toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ row, line });
  });

  const created = [];

  for (const [, groupRows] of groups) {
    const first = groupRows[0].row;
    let nameIt = String(first.name_it ?? "").trim();
    let nameEn = String(first.name_en ?? "").trim();
    // Mirror across locales if only one provided
    if (nameIt && !nameEn) nameEn = nameIt;
    else if (nameEn && !nameIt) nameIt = nameEn;
    const brand = String(first.brand ?? "").trim();
    const categoryRaw = String(first.category ?? "").trim();
    const categories = categoryRaw ? [categoryRaw] : [];
    // Barcodes live on the product, not the variant — take the first one given
    const barcode = groupRows.map(({ row }) => String(row.barcode ?? "").trim()).find(Boolean) || null;

    const variants: { size: string; color: string; price: number; qty: number }[] = [];
    const seen = new Set<string>();
    for (const { row, line } of groupRows) {
      const size = String(row.size ?? "").trim();
      const color = String(row.color ?? "").trim();
      const price = parseEuro(row.price);
      const qty = parseInt(String(row.qty ?? "0"), 10);
      const key = `${size.toLowerCase()}|${color.toLowerCase()}`;

      let problem = "";
      if (!size) problem = "taglia mancante / missing size";
      else if (!color) problem = "colore mancante / missing color";
      else if (price === null) problem = `prezzo non valido "${row.price}" / invalid price`;
      else if (String(row.qty ?? "").trim() && (isNaN(qty) || qty < 0)) problem = `quantità non valida "${row.qty}" / invalid qty`;
      else if (seen.has(key)) problem = `variante duplicata ${size} ${color} / duplicate variant`;

      if (problem) {
        failed++;
        errors.push(`Riga ${line}: ${problem}`);
        continue;
      }
      seen.add(key);
      variants.push({ size, color, price: price!, qty: isNaN(qty) ? 0 : qty });
    }

    if (variants.length === 0) continue;

    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const slug = slugify(`${brand}-${nameEn}-${suffix}`) || `product-${suffix}`;

    try {
      const product = await prisma.product.create({
        data: {
          slug, nameIt, nameEn, brand, categories, barcode,
          variants: { create: variants },
        },
        include: {
          variants: true,
          images: true,
        },
      });
      created.push(product);
    } catch (e) {
      failed += variants.length;
      const code = (e as { code?: string }).code;
      const reason = code === "P2002" ? "barcode già esistente / barcode already exists" : "errore database / database error";
      if (code !== "P2002") console.error(e);
      errors.push(`${brand} ${nameEn} (righe ${groupRows.map((g) => g.line).join(", ")}): ${reason}`);
    }
  }

  return NextResponse.json({ success: created.length, failed, errors, products: created });
}
