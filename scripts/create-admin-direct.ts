import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

const EMAIL = process.argv[2];
const NAME = process.argv[3] ?? "Admin";

async function main() {
  if (!EMAIL) {
    console.error("Usage: npx tsx scripts/create-admin-direct.ts <email> [name]");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`User '${EMAIL}' already exists (id: ${existing.id}).`);
    return;
  }

  const user = await prisma.user.create({ data: { email: EMAIL, name: NAME } });
  console.log(`Admin created: ${user.email} (id: ${user.id})`);
  console.log(`Login at /it/admin/login with password from ADMIN_PASSWORD env var.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
