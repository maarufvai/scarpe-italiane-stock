import * as XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rows = [
  // Headers are the first row via SheetJS
  // Product 1 — Mocassino (3 variants)
  {
    name_en: "Artisan Loafer",
    name_it: "Mocassino Artigianale",
    brand: "Rossimoda",
    category: "Mocassini",
    size: "40",
    color: "Nero",
    price: 129.00,
    qty: 2,
    barcode: "",
  },
  {
    name_en: "Artisan Loafer",
    name_it: "Mocassino Artigianale",
    brand: "Rossimoda",
    category: "Mocassini",
    size: "41",
    color: "Nero",
    price: 129.00,
    qty: 1,
    barcode: "",
  },
  {
    name_en: "Artisan Loafer",
    name_it: "Mocassino Artigianale",
    brand: "Rossimoda",
    category: "Mocassini",
    size: "42",
    color: "Marrone",
    price: 129.00,
    qty: 3,
    barcode: "1234567890123",
  },

  // Product 2 — Sneaker (2 variants)
  {
    name_en: "Classic Sneaker",
    name_it: "Sneaker Classica",
    brand: "Calzaturificio Veneto",
    category: "Sneakers",
    size: "43",
    color: "Bianco",
    price: 89.00,
    qty: 2,
    barcode: "",
  },
  {
    name_en: "Classic Sneaker",
    name_it: "Sneaker Classica",
    brand: "Calzaturificio Veneto",
    category: "Sneakers",
    size: "44",
    color: "Bianco",
    price: 89.00,
    qty: 1,
    barcode: "",
  },

  // Product 3 — Stivale (1 variant)
  {
    name_en: "Leather Boot",
    name_it: "Stivale in Pelle",
    brand: "Rossimoda",
    category: "Stivali",
    size: "39",
    color: "Testa di Moro",
    price: 199.00,
    qty: 1,
    barcode: "9876543210987",
  },
];

const ws = XLSX.utils.json_to_sheet(rows, {
  header: ["name_en", "name_it", "brand", "category", "size", "color", "price", "qty", "barcode"],
});

// Column widths
ws["!cols"] = [
  { wch: 22 }, // name_en
  { wch: 26 }, // name_it
  { wch: 24 }, // brand
  { wch: 16 }, // category
  { wch: 8  }, // size
  { wch: 18 }, // color
  { wch: 10 }, // price
  { wch: 8  }, // qty
  { wch: 18 }, // barcode
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Prodotti");

const outPath = join(__dirname, "..", "template-prodotti.xlsx");
XLSX.writeFile(wb, outPath);
console.log("Created: template-prodotti.xlsx");
