# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Italian shoe ecommerce store with offline/online inventory sync. Sells shoes in low quantities (usually <3 per variant). Has both online store and physical shop in Italy.

## Commands

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # ESLint
npx tsc --noEmit   # type check only
npx prisma migrate dev --name <name>   # new migration
npx prisma studio  # visual DB browser
npx prisma db push # push schema without migration (prototyping)
```

## Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: PostgreSQL via Supabase — use `DATABASE_URL` (pooled) + `DIRECT_URL` (direct, for migrations)
- **ORM**: Prisma — schema at `prisma/schema.prisma`
- **Styling**: Tailwind CSS + shadcn/ui (slate theme, components in `src/components/ui/`)
- **i18n**: next-intl — Italian (default) + English toggle
- **Payments**: Stripe + PayPal
- **AI descriptions**: Anthropic Claude API — generate in IT and EN simultaneously
- **Excel import**: SheetJS (`xlsx`) — bulk product upload
- **Barcode scanning**: `@zxing/browser` — camera-based, no hardware scanner needed
- **Hosting**: Hostinger Business (Node.js 20.x), Supabase for DB + image storage

## Key Domain Rules

- **Currency**: EUR only
- **VAT**: Italian IVA 22% — must display on checkout, included in shown price
- **Market**: Italy — integrate BRT, GLS, or Poste Italiane for shipping
- **Language**: Italian is default locale, English is secondary

## Architecture

### Route Structure (planned)

```
src/app/
  [locale]/             # next-intl locale wrapper (it | en)
    (store)/            # public storefront
      page.tsx          # homepage
      scarpe/           # product listing
      scarpe/[slug]/    # product detail
      carrello/         # cart
      checkout/         # checkout flow
    (admin)/            # password-protected admin
      admin/
        prodotti/       # product management
        ordini/         # order management
        scanner/        # barcode toggle page (PIN-protected, no full auth)
  api/
    products/
    orders/
    scanner/toggle/     # POST: toggle variant LIVE/PAUSED by barcode
    ai/describe/        # POST: generate IT+EN descriptions via Claude API
    webhooks/stripe/
    webhooks/paypal/
```

### Data Model

`Product` → `ProductVariant` (size + color) → `OrderItem`

Each `ProductVariant` has:
- `barcode` (EAN from manufacturer, or auto-generated QR)
- `status`: `LIVE | PAUSED` — paused hides from storefront without deleting
- `qty` — when 0, auto-hides from storefront regardless of status

Scanning a barcode on the scanner page toggles `status` between LIVE/PAUSED for that specific variant only. Other variants of same product are unaffected.

### Prisma Client

Import from `@prisma/client`. Singleton pattern in `src/lib/prisma.ts`.

### Image Storage

Supabase Storage bucket `product-images`. Store URLs in `ProductImage.url`.

### Admin Auth vs Scanner PIN

- Full admin (`/admin/*`): NextAuth session required
- Scanner page (`/admin/scanner`): simple PIN check against `SCANNER_PIN` env var — no session needed, fast access from phone

## Environment Variables

```
DATABASE_URL=         # Supabase pooled connection string
DIRECT_URL=           # Supabase direct connection string (migrations)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
ANTHROPIC_API_KEY=    # Claude API for AI descriptions
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SCANNER_PIN=          # PIN for barcode scanner page
```

## Excel Bulk Import Format

Expected columns (case-insensitive): `name_en`, `name_it`, `brand`, `category`, `size`, `color`, `price`, `qty`, `barcode` (optional). Each row = one variant. Products grouped by `name_en + brand`.
