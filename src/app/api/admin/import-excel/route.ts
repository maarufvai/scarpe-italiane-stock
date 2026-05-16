import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  // Normalise header keys to lowercase
  const normalised = rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]))
  );

  // Group rows by best-available name + brand → one product per group
  const groups = new Map<string, typeof normalised>();
  for (const row of normalised) {
    const nameEn = String(row.name_en ?? "").trim();
    const nameIt = String(row.name_it ?? "").trim();
    const groupName = nameEn || nameIt;
    const brand = String(row.brand ?? "").trim();
    if (!groupName || !brand) continue;
    const key = `${groupName}||${brand}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const created = [];
  let failed = 0;

  for (const [, groupRows] of groups) {
    const first = groupRows[0];
    let nameIt = String(first.name_it ?? "").trim();
    let nameEn = String(first.name_en ?? "").trim();
    // Mirror across locales if only one provided
    if (nameIt && !nameEn) nameEn = nameIt;
    else if (nameEn && !nameIt) nameIt = nameEn;
    const brand = String(first.brand ?? "").trim();
    const categoryRaw = String(first.category ?? "").trim();
    const categories = categoryRaw ? [categoryRaw] : [];

    if (!nameIt || !nameEn || !brand) { failed += groupRows.length; continue; }

    const baseSlug = slugify(`${brand}-${nameEn}`);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const variants = groupRows
      .filter((r) => String(r.size ?? "").trim() && String(r.color ?? "").trim() && r.price)
      .map((r) => ({
        size: String(r.size).trim(),
        color: String(r.color).trim(),
        price: Math.round(parseFloat(String(r.price)) * 100),
        qty: parseInt(String(r.qty ?? "0")) || 0,
        barcode: String(r.barcode ?? "").trim() || null,
      }));

    if (variants.length === 0) { failed += groupRows.length; continue; }

    try {
      const product = await prisma.product.create({
        data: {
          slug, nameIt, nameEn, brand, categories,
          variants: { create: variants },
        },
        include: {
          variants: true,
          images: true,
        },
      });
      created.push(product);
    } catch {
      failed += groupRows.length;
    }
  }

  return NextResponse.json({ success: created.length, failed, products: created });
}
