Run pre-deployment checks before pushing to Hostinger.

Run these commands in order and stop on first failure:

1. `npm run lint` — ESLint
2. `npx tsc --noEmit` — TypeScript type check
3. `npm run build` — production build

Report results clearly: which checks passed, which failed, and what to fix before deploying.

If all pass, remind the user:
- Set all required env vars on Hostinger (DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, STRIPE keys, PAYPAL keys, ANTHROPIC_API_KEY, SUPABASE keys, SCANNER_PIN)
- Run `npx prisma migrate deploy` on the server (not `migrate dev`)
- Node.js version on Hostinger must be 20.x
