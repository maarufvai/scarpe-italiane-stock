Run a Prisma migration for this project.

1. Ask the user for a migration name if not provided (short snake_case description of what changed, e.g. `add_barcode_to_variant`).
2. Run: `npx prisma migrate dev --name <name>`
3. If the user is prototyping and doesn't need a migration file, offer: `npx prisma db push` instead.
4. After migration succeeds, check if `prisma/seed.ts` exists and ask if the user wants to re-seed.
5. Remind the user that `DIRECT_URL` must be set in `.env.local` for migrations to work (pooled `DATABASE_URL` won't work for migrations).
