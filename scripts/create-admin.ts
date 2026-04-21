import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import * as readline from "readline";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

async function main() {
  const email = await ask("Admin email: ");
  const name = await ask("Admin name (display): ");
  rl.close();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User '${email}' already exists (id: ${existing.id}).`);
    return;
  }

  const user = await prisma.user.create({
    data: { email, name: name || "Admin" },
  });

  console.log(`\nAdmin created:`);
  console.log(`  Email: ${user.email}`);
  console.log(`  ID:    ${user.id}`);
  console.log(`\nMake sure ADMIN_PASSWORD is set in .env.local.`);
  console.log(`Login at: /it/admin/login`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
