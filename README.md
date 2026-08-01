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
- Prisma with SQLite for local development
- Plan catalog imported from `data/prices.csv`

## Requirements

- Node.js 20+
- npm 10+

## Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/LinCodex/ezTravel.git
cd ezTravel
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set strong values for `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` before deploying. See [SECURITY.md](./SECURITY.md).

3. Create the database and import plans:

```bash
npm run db:push
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Apply Prisma schema to the local database |
| `npm run db:seed` | Import / refresh plans from `data/prices.csv` |

## Admin panel

- URL: `/admin`
- Credentials: `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`
- **Orders**: confirm Zelle / WeChat payments; confirmation provisions the eSIM
- **Pricing**: search plans, override sell prices, hide or show plans

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
