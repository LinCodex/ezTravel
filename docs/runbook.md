# Runbook

## Local start

```bash
cp .env.example .env
npm install
npx prisma db push   # or: npm run db:migrate
npm run db:seed      # import plans from data/prices.csv
npm run dev
```

Mock provisioning is on by default when `ESIMACCESS_ACCESS_CODE` is empty.

## Deploy checklist

1. Set production secrets from `.env.example` (admin password, session secrets ≥24 chars).
2. Point `DATABASE_URL` at the production DB; run `npm run db:migrate`.
3. Set `NEXT_PUBLIC_APP_URL` to the public HTTPS origin.
4. Optionally configure Resend (`RESEND_API_KEY`, `EMAIL_FROM`).
5. For live eSIMs: Access credentials + `ESIMACCESS_USE_MOCK=0` + register webhook.
6. `npm run build && npm start` (or platform deploy).

## Secret rotation

- Rotate `ADMIN_SESSION_SECRET` / `PARTNER_SESSION_SECRET` → all sessions invalidate.
- Rotate Access secret → update env and re-register webhook if required by Access.
- Rotate admin password via env; no in-app multi-admin yet.

## Admin operations

| Task | Where |
|---|---|
| Confirm Zelle/WeChat | Orders → Confirm |
| Retry failed provision | Orders detail → Retry |
| Refund + cancel profile | Orders detail → Refund |
| Resend delivery email | Orders detail → Resend |
| Suspend / revoke eSIM | eSIMs console or partner detail |
| Review partner top-ups | Top-ups |
| Sync catalog from provider | `POST /api/admin/plans/sync` or `npm run plans:sync` |
| CRM notes on partner | Partners → detail → Admin notes |

## Incident: failed provisioning

1. Check Orders filter **Failed** — inspect `failureReason`.
2. Confirm supplier balance (`Dashboard` widget / `balanceQuery`).
3. Retry from order detail (calls `provisionOrder` again).
4. If supplier allocated but DB missing profile, re-provision or reconcile via `esimTranNo`.
5. If payment captured but eSIM impossible, Refund (calls `cancelEsim` when a profile exists) and contact the customer.

## Smoke test (mock)

1. Consumer: buy with mock Square → status goes `PAID` then `DELIVERED`; delivery page shows QR; console shows delivery email log.
2. Partner: buy from store → eSIM grid shows flag/details → QuickShare link opens branded delivery.
3. Admin: dashboard numbers move; confirm/refund/retry paths work; webhook simulate updates partner eSIM status.
