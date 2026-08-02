# ezTravel

Bilingual (English / 中文) travel eSIM store for customers buying data plans before they fly. Plans are sourced from a supplier price catalog; the live provider integration is currently mocked for local development.

## Features

- Browse 200+ destinations with local, regional, and global plans
- Cart and single-plan checkout
- Payments: Zelle and WeChat Pay (manual confirmation) and Square (mock card flow)
- Order lookup with eSIM QR delivery after confirmation
- Admin panel for order confirmation and pricing overrides
- English / Chinese UI

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Prisma with Postgres (Neon via Vercel Storage)
- Plan catalog imported from `data/prices.csv`

## Requirements

- Node.js 20+
- npm 10+
- A Postgres `DATABASE_URL` (create free Neon in Vercel → Storage)

## Setup

1. Clone and install:

```bash
git clone https://github.com/LinCodex/ezTravel.git
cd ezTravel
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

Paste a Neon `DATABASE_URL` (from Vercel → Storage). Set admin/session secrets. See [SECURITY.md](./SECURITY.md).

3. Create tables + seed:

```bash
npm run db:push
npm run db:prepare
```

4. Start:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build (also pushes schema + prepares DB) |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Apply Prisma schema |
| `npm run db:prepare` | Seed plans (if empty) + demo partner |
| `npm run db:seed` | Re-import plans from `data/prices.csv` |

## Local mock logins

| Surface | URL | Credentials |
| --- | --- | --- |
| Consumer store | `/` | No login — checkout with any email |
| Admin | `/admin/login` | `admin` / `eztravel123` (from `.env`) |
| Partner portal | `/partner/login` | `demo@partner.test` / `partner123` |

## Production (Vercel) — 3 steps

SQLite does not work on Vercel. See **[docs/production-in-3-steps.md](./docs/production-in-3-steps.md)**:

1. Vercel → **Storage** → Create **Neon** database  
2. Set admin/session env vars  
3. Redeploy (build auto-creates tables + demo partner)

Use the same Neon `DATABASE_URL` in local `.env` so local and production share one DB.

## Admin panel

- URL: `/admin`
- Credentials: see **Local mock logins** above
- **Dashboard / Orders / eSIMs / Customers / Partners / Top-ups / Pricing**
- Confirming Zelle / WeChat payments provisions the eSIM

Admin price overrides are preserved across `npm run db:seed` runs when `priceOverridden` is set.

## Pricing formula

Sell price is derived from supplier cost with a tiered markup, then rounded to `.49` / `.99` endings:

| Cost | Markup |
| --- | --- |
| ≤ $3 | ×2.5 |
| $3–10 | ×2.2 |
| $10–25 | ×1.9 |
| $25–50 | ×1.6 |
| > $50 | ×1.4 |

Implementation: `src/lib/pricing.ts`.

## Payments

| Method | Behavior |
| --- | --- |
| Zelle | Customer pays out of band; admin confirms within about 1 hour |
| WeChat Pay | Same manual confirmation flow with a placeholder QR |
| Square | Mock card form; confirms and delivers instantly in demo mode |

Update `NEXT_PUBLIC_ZELLE_*` in `.env` with your real recipient details before going live.

## Supplier integration

`src/lib/esim/mock-provider.ts` simulates ordering an eSIM profile (order number → allocated activation / QR). Replace that module with calls to your supplier API while keeping the same interface used by `src/lib/esim/provision.ts`.

## Project layout

```
src/app/           App Router pages and API routes
src/components/    Shared UI
src/lib/           DB, i18n, cart, pricing, eSIM helpers
prisma/            Schema (database files are gitignored)
data/prices.csv    Plan catalog for seeding
scripts/           Seed and utility scripts
```

## License

See [LICENSE](./LICENSE).
