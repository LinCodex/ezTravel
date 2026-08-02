# eSIM Access integration

This app talks to the [eSIM Access Open API](https://docs.esimaccess.com/) through `src/lib/esim/access-client.ts`. Every call has a mock branch in `src/lib/esim/mock-provider.ts` so local development works without credentials.

## Auth

Outbound requests send:

- `RT-AccessCode` — account access code
- Optional HMAC: `RT-Timestamp`, `RT-RequestID`, `RT-Signature`  
  `signature = HMAC-SHA256(secret, timestamp + requestId + accessCode + body)`

Inbound webhooks use the same HMAC over the raw body (`src/app/api/webhooks/esimaccess/route.ts`).

## Env

| Variable | Purpose |
|---|---|
| `ESIMACCESS_ACCESS_CODE` | Account access code |
| `ESIMACCESS_SECRET_KEY` | HMAC secret (required for signed callbacks in production) |
| `ESIMACCESS_BASE_URL` | Defaults to `https://api.esimaccess.com/api/v1/open` |
| `ESIMACCESS_USE_MOCK` | `1` force mock, `0` force live, unset = mock when no access code |

## Function ↔ endpoint map

| Our function | Access path | Notes |
|---|---|---|
| `balanceQuery` | `POST /balance/query` | Balance ÷ 10000 = USD |
| `packageList` | `POST /package/list` | Catalog sync source |
| `orderEsimProfile` | `POST /esim/order` + poll `/esim/query` | Returns `esimTranNo`, ICCID, LPA |
| `topUpEsim` | `POST /esim/topup` | Needs `esimTranNo` or ICCID |
| `cancelEsim` | `POST /esim/cancel` | Unused profile refund |
| `suspendEsim` / `unsuspendEsim` | `POST /esim/suspend` / `/esim/unsuspend` | |
| `revokeEsim` | `POST /esim/revoke` | Permanent, no refund |
| `usageQuery` | `POST /esim/usage/query` | Prefer `esimTranNo` |
| `registerWebhook` | `POST /webhook/save` | Register public HTTPS URL |
| `queryWebhook` | `POST /webhook/query` | |

## Webhook events

Receiver: `POST /api/webhooks/esimaccess`

| `notifyType` | Effect |
|---|---|
| `ORDER_STATUS` | Mark consumer/partner order failed when supplier reports FAIL/CANCEL |
| `SMDP_EVENT` / `ESIM_STATUS` | Partner eSIM `PENDING_ACTIVATION` → `ACTIVE` on install/enable |
| `DATA_USAGE` | Update `PartnerEsim.dataRemainingGb` |

Dev simulator (admin auth, mock only): `POST /api/webhooks/esimaccess/simulate`.

## Mock parity

| Capability | Mock | Live |
|---|---|---|
| Order profile + `esimTranNo` | ✅ | ✅ |
| Top-up / cancel / suspend / revoke | ✅ | ✅ |
| Usage query | Stable deterministic % | Real bytes |
| Package list | Mirrors local `Plan` table | Supplier catalog |
| Webhook registration | In-memory | Persisted at Access |
| Inbound webhook path | Simulator | Real callbacks |

## Sandbox → production checklist

1. Obtain Access sandbox credentials; set `ESIMACCESS_USE_MOCK=0`.
2. Point `NEXT_PUBLIC_APP_URL` at a public HTTPS origin.
3. `registerWebhook(`${APP_URL}/api/webhooks/esimaccess`)`.
4. Place a small test order; confirm `ORDER_STATUS` + delivery page.
5. Switch to production Access credentials; rotate secrets.
6. Run `npm run plans:sync` (or admin sync) against live `packageList`.
7. Keep mock mode available for staging via `ESIMACCESS_USE_MOCK=1`.
