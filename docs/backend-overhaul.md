# Backend overhaul (future work)

This document captures the cutover work deliberately left out of the current mock-first production prep.

## SQLite → Postgres

1. Set `DATABASE_URL` to a Postgres connection string.
2. Change `provider = "postgresql"` in `prisma/schema.prisma` and `prisma/migrations/migration_lock.toml`.
3. Replay migrations (`npm run db:migrate`) or `prisma migrate diff` from the SQLite baseline.
4. Copy data with a one-shot export/import script (plans, partners, orders, eSIMs).
5. Enable connection pooling (PgBouncer / Neon pooler) for serverless deploys.

## Real payment gateway

Payments are isolated behind `src/lib/payments/`:

- `PaymentGateway.charge({ amountUsd, orderRef, email, method })`
- Current: `mockSquareGateway`, `manualPaymentGateway`

To add Stripe/Square live:

1. Implement `stripeGateway` / `squareGateway` against the same interface.
2. Map webhook events (payment_intent.succeeded / payment.updated) to `provisionOrder`.
3. Persist `providerRef` on `Order` (new column) for reconciliation.
4. Keep Zelle/WeChat as manual methods with admin confirm.

## Background jobs

Needed once live volume grows:

| Job | Purpose |
|---|---|
| Usage poller | Refresh `dataRemainingGb` for active eSIMs via `usageQuery` |
| Expiry sweep | Mark `EXPIRED` when `expiresAt` passes |
| Webhook retry | Re-deliver failed internal side-effects |
| Catalog sync | Nightly `packageList` upsert (preserve `priceOverridden`) |

Options: Vercel Cron, Inngest, or a small worker process.

## Email / queue

- Today: Resend via `src/lib/email.ts` (console fallback).
- Next: queue outbound mail, add delivery/bounce webhooks, partner digest emails.

## Rate limiting

`src/lib/rate-limit.ts` is an in-memory token bucket. For multi-instance deploys, swap the Map for Redis (`INCR` + `EXPIRE`) keeping the same `rateLimit(key, { limit, windowMs })` signature.

## Tests / CI

Out of scope for the current plan. Recommended next:

- Playwright smoke: consumer checkout (mock Square), partner buy → QuickShare, admin confirm/refund.
- GitHub Action: `npm run lint && npm run build` on PR.
