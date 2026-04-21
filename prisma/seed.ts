import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

const products = [
  {
    slug: "oxford-derby-classico",
    nameIt: "Oxford Derby Classico",
    nameEn: "Classic Oxford Derby",
    brand: "Brunello",
    category: "Oxford",
    descIt: "Scarpa classica in pelle pieno fiore, suola in cuoio, perfetta per occasioni formali.",
    descEn: "Full-grain leather classic oxford, leather sole, perfect for formal occasions.",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    ],
    variants: [
      { size: "40", color: "Nero", colorCode: "#1a1a1a", price: 18900, qty: 2 },
      { size: "41", color: "Nero", colorCode: "#1a1a1a", price: 18900, qty: 3 },
      { size: "42", color: "Nero", colorCode: "#1a1a1a", price: 18900, qty: 1 },
      { size: "43", color: "Nero", colorCode: "#1a1a1a", price: 18900, qty: 2 },
      { size: "41", color: "Marrone", colorCode: "#5C3317", price: 18900, qty: 2 },
      { size: "42", color: "Marrone", colorCode: "#5C3317", price: 18900, qty: 3 },
      { size: "43", color: "Marrone", colorCode: "#5C3317", price: 18900, qty: 1 },
    ],
  },
  {
    slug: "mocassino-milano",
    nameIt: "Mocassino Milano",
    nameEn: "Milan Loafer",
    brand: "Ferragamo Style",
    category: "Mocassino",
    descIt: "Mocassino artigianale con nappina, pelle morbida di vitello, fodera in pelle.",
    descEn: "Handcrafted tassel loafer, soft calfskin leather, full leather lining.",
    images: [
      "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&q=80",
    ],
    variants: [
      { size: "39", color: "Cognac", colorCode: "#9B4400", price: 14900, qty: 2 },
      { size: "40", color: "Cognac", colorCode: "#9B4400", price: 14900, qty: 3 },
      { size: "41", color: "Cognac", colorCode: "#9B4400", price: 14900, qty: 2 },
      { size: "42", color: "Cognac", colorCode: "#9B4400", price: 14900, qty: 1 },
      { size: "40", color: "Nero", colorCode: "#1a1a1a", price: 14900, qty: 2 },
      { size: "41", color: "Nero", colorCode: "#1a1a1a", price: 14900, qty: 2 },
      { size: "42", color: "Nero", colorCode: "#1a1a1a", price: 14900, qty: 3 },
      { size: "43", color: "Nero", colorCode: "#1a1a1a", price: 14900, qty: 1 },
    ],
  },
  {
    slug: "stivale-chelsea-toscana",
    nameIt: "Stivale Chelsea Toscana",
    nameEn: "Tuscany Chelsea Boot",
    brand: "Cuoio di Toscana",
    category: "Stivale",
    descIt: "Chelsea boot in pelle toscana conciata al vegetale, elastici laterali, tacco 3 cm.",
    descEn: "Vegetable-tanned Tuscan leather chelsea boot, side elastics, 3 cm heel.",
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80",
    ],
    variants: [
      { size: "38", color: "Marrone Scuro", colorCode: "#3B1F0A", price: 22900, qty: 2 },
      { size: "39", color: "Marrone Scuro", colorCode: "#3B1F0A", price: 22900, qty: 1 },
      { size: "40", color: "Marrone Scuro", colorCode: "#3B1F0A", price: 22900, qty: 3 },
      { size: "41", color: "Marrone Scuro", colorCode: "#3B1F0A", price: 22900, qty: 2 },
      { size: "39", color: "Nero", colorCode: "#1a1a1a", price: 22900, qty: 2 },
      { size: "40", color: "Nero", colorCode: "#1a1a1a", price: 22900, qty: 1 },
      { size: "41", color: "Nero", colorCode: "#1a1a1a", price: 22900, qty: 2 },
      { size: "42", color: "Nero", colorCode: "#1a1a1a", price: 22900, qty: 3 },
    ],
  },
  {
    slug: "sneaker-urbana-venezia",
    nameIt: "Sneaker Urbana Venezia",
    nameEn: "Venice Urban Sneaker",
    brand: "Venezia Sport",
    category: "Sneaker",
    descIt: "Sneaker in pelle e tela, suola in gomma vulcanizzata, stile minimal italiano.",
    descEn: "Leather and canvas sneaker, vulcanized rubber sole, minimal Italian style.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    variants: [
      { size: "39", color: "Bianco", colorCode: "#F5F5F0", price: 9900, qty: 3 },
      { size: "40", color: "Bianco", colorCode: "#F5F5F0", price: 9900, qty: 2 },
      { size: "41", color: "Bianco", colorCode: "#F5F5F0", price: 9900, qty: 3 },
      { size: "42", color: "Bianco", colorCode: "#F5F5F0", price: 9900, qty: 2 },
      { size: "43", color: "Bianco", colorCode: "#F5F5F0", price: 9900, qty: 1 },
      { size: "40", color: "Grigio", colorCode: "#8A8A8A", price: 9900, qty: 2 },
      { size: "41", color: "Grigio", colorCode: "#8A8A8A", price: 9900, qty: 3 },
      { size: "42", color: "Grigio", colorCode: "#8A8A8A", price: 9900, qty: 2 },
      { size: "40", color: "Nero", colorCode: "#1a1a1a", price: 9900, qty: 2 },
      { size: "41", color: "Nero", colorCode: "#1a1a1a", price: 9900, qty: 3 },
      { size: "42", color: "Nero", colorCode: "#1a1a1a", price: 9900, qty: 1 },
    ],
  },
  {
    slug: "derby-brogue-firenze",
    nameIt: "Derby Brogue Firenze",
    nameEn: "Florence Brogue Derby",
    brand: "Artigiano Fiorentino",
    category: "Oxford",
    descIt: "Derby brogue in pelle bicolore lavorata a mano, suola Blake, made in Firenze.",
    descEn: "Hand-stitched two-tone brogue derby, Blake sole construction, made in Florence.",
    images: [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
    ],
    variants: [
      { size: "40", color: "Bicolore Cognac", colorCode: "#9B4400", price: 24900, qty: 1 },
      { size: "41", color: "Bicolore Cognac", colorCode: "#9B4400", price: 24900, qty: 2 },
      { size: "42", color: "Bicolore Cognac", colorCode: "#9B4400", price: 24900, qty: 2 },
      { size: "43", color: "Bicolore Cognac", colorCode: "#9B4400", price: 24900, qty: 1 },
      { size: "41", color: "Marrone Miele", colorCode: "#C47A2B", price: 24900, qty: 2 },
      { size: "42", color: "Marrone Miele", colorCode: "#C47A2B", price: 24900, qty: 3 },
    ],
  },
  {
    slug: "sandalo-romano",
    nameIt: "Sandalo Romano",
    nameEn: "Roman Sandal",
    brand: "Romantica",
    category: "Sandalo",
    descIt: "Sandalo flat in pelle nappa, fasce incrociate, suola in cuoio leggero.",
    descEn: "Flat nappa leather sandal, crisscross straps, lightweight leather sole.",
    images: [
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&q=80",
    ],
    variants: [
      { size: "36", color: "Cognac", colorCode: "#9B4400", price: 7900, qty: 3 },
      { size: "37", color: "Cognac", colorCode: "#9B4400", price: 7900, qty: 2 },
      { size: "38", color: "Cognac", colorCode: "#9B4400", price: 7900, qty: 3 },
      { size: "39", color: "Cognac", colorCode: "#9B4400", price: 7900, qty: 2 },
      { size: "37", color: "Nero", colorCode: "#1a1a1a", price: 7900, qty: 2 },
      { size: "38", color: "Nero", colorCode: "#1a1a1a", price: 7900, qty: 3 },
      { size: "39", color: "Nero", colorCode: "#1a1a1a", price: 7900, qty: 1 },
      { size: "40", color: "Nero", colorCode: "#1a1a1a", price: 7900, qty: 2 },
    ],
  },
];

async function main() {
  console.log("Seeding demo products...");

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`  skip: ${p.slug} (already exists)`);
      continue;
    }

    await prisma.product.create({
      data: {
        slug: p.slug,
        nameIt: p.nameIt,
        nameEn: p.nameEn,
        brand: p.brand,
        category: p.category,
        descIt: p.descIt,
        descEn: p.descEn,
        images: {
          create: p.images.map((url, i) => ({ url, position: i })),
        },
        variants: {
          create: p.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorCode: v.colorCode,
            price: v.price,
            qty: v.qty,
            status: "LIVE",
          })),
        },
      },
    });

    console.log(`  created: ${p.nameEn} (${p.variants.length} variants)`);
  }

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
