# Architecture

## System map

```mermaid
flowchart TB
  consumer[Consumer marketplace]
  partner[Partner portal]
  admin[Admin CRM]
  api[Next.js App Router API]
  db[(SQLite / future Postgres)]
  provider[Provider layer]
  mock[mock-provider]
  access[eSIM Access Open API]
  webhook[/api/webhooks/esimaccess]
  email[Resend / console]
  payments[src/lib/payments]

  consumer --> api
  partner --> api
  admin --> api
  api --> db
  api --> provider
  api --> payments
  api --> email
  provider -->|mock| mock
  provider -->|live| access
  access --> webhook
  mock -.->|simulate| webhook
  webhook --> db
```

## Data model (high level)

- **Plan** — retail catalog (supplier `packageCode` as id)
- **Order** — consumer purchase + eSIM fields (`esimIccid`, `esimActivation`, `esimTranNo`, statuses)
- **Partner** — reseller account, balance, brand, `adminNotes`
- **PartnerOrder** / **PartnerOrderItem** — wholesale checkout
- **PartnerEsim** — inventory profiles (`archived`, usage, lifecycle status)
- **BalanceTopUp** — partner balance funding requests
- **QuickShareLink** — branded delivery tokens

## Auth systems

| Surface | Mechanism |
|---|---|
| Admin | HMAC cookie (`ADMIN_SESSION_SECRET`) |
| Partner | HMAC cookie (`PARTNER_SESSION_SECRET`) |
| Consumer order lookup | orderRef + email (no account) |
| Webhooks | RT-Signature HMAC |

## Money flows

1. **Consumer retail** — Zelle/WeChat (manual confirm) or mock Square → `PAID` → provision → `DELIVERED`
2. **Partner wholesale** — debit `Partner.balanceUsd` at checkout; top-ups approved by admin
3. **Supplier** — ezTravel prepaid balance at eSIM Access (`balanceQuery`)

## Order status state machine (consumer)

```
AWAITING_PAYMENT ──(Square charge)──► PAID ──(provision)──► DELIVERED
AWAITING_CONFIRMATION ──(admin confirm)──► PAID ──► DELIVERED
PAID / provision error ──► FAILED ──(admin retry)──► DELIVERED
DELIVERED / others ──(admin refund)──► REFUNDED
* ──► CANCELLED
```

Partner eSIM statuses: `PENDING_ACTIVATION` → `ACTIVE` → `EXPIRED` / `SUSPENDED` / `REVOKED` / `REFUNDED`, plus `archived` flag for UI.
