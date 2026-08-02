/**
 * eSIM Access Open API client.
 * Auth: RT-AccessCode + optional HMAC-SHA256 request signing.
 * Prices from API are /10000 = USD when reading list endpoints.
 *
 * Every operation has a mock branch (see mock-provider.ts) so the whole app
 * runs locally without credentials; setting ESIMACCESS_ACCESS_CODE (and
 * optionally ESIMACCESS_USE_MOCK=0) switches to the live API with no code
 * changes. See docs/esimaccess-integration.md for the endpoint mapping.
 */

import { createHmac, randomUUID } from "crypto";
import {
  mockCancelEsim,
  mockPackageList,
  mockQueryWebhook,
  mockRevokeEsim,
  mockSaveWebhook,
  mockSuspendEsim,
  mockTopUpEsim,
  mockUnsuspendEsim,
  mockUsageQuery,
  orderEsimProfile as mockOrderEsimProfile,
  type EsimProfile,
  type EsimUsage,
  type LifecycleResult,
  type SupplierPackage,
} from "./mock-provider";

const DEFAULT_BASE = "https://api.esimaccess.com/api/v1/open";

function accessCode(): string {
  return process.env.ESIMACCESS_ACCESS_CODE?.trim() || "";
}

function secretKey(): string {
  return process.env.ESIMACCESS_SECRET_KEY?.trim() || "";
}

function baseUrl(): string {
  return (process.env.ESIMACCESS_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, "");
}

export function isAccessConfigured(): boolean {
  return accessCode().length > 0;
}

function useMock(): boolean {
  if (process.env.ESIMACCESS_USE_MOCK === "1") return true;
  if (process.env.ESIMACCESS_USE_MOCK === "0") return false;
  return !isAccessConfigured();
}

/** True when provisioning runs against the mock provider instead of the live Access API. */
export function isMockProvisioning(): boolean {
  return useMock();
}

function signHeaders(body: string): Record<string, string> {
  const code = accessCode();
  const secret = secretKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "RT-AccessCode": code,
  };
  if (secret) {
    const timestamp = Date.now().toString();
    const requestId = randomUUID().replace(/-/g, "");
    const payload = `${timestamp}${requestId}${code}${body}`;
    const signature = createHmac("sha256", secret).update(payload).digest("hex").toLowerCase();
    headers["RT-RequestID"] = requestId;
    headers["RT-Timestamp"] = timestamp;
    headers["RT-Signature"] = signature;
  }
  return headers;
}

async function accessPost<T>(path: string, body: unknown = {}): Promise<T> {
  const json = JSON.stringify(body ?? {});
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: signHeaders(json),
    body: json,
  });
  const data = (await res.json()) as {
    success?: boolean;
    errorCode?: string | null;
    errorMsg?: string | null;
    obj?: T;
  };
  if (!res.ok || data.success === false) {
    throw new Error(data.errorMsg || data.errorCode || `Access API error (${res.status})`);
  }
  return data.obj as T;
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export async function balanceQuery(): Promise<{ balance: number }> {
  if (useMock()) return { balance: 9999 };
  const obj = await accessPost<{ balance?: number }>("/balance/query", {});
  return { balance: (obj?.balance ?? 0) / 10000 };
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

type RawPackage = {
  packageCode?: string;
  slug?: string;
  name?: string;
  price?: number;
  currencyCode?: string;
  volume?: number;
  unusedValidTime?: number;
  duration?: number;
  durationUnit?: string;
  location?: string;
  description?: string;
  activeType?: number;
  supportTopUpType?: number;
  dataType?: number;
  speed?: string;
};

export async function packageList(
  params: { locationCode?: string } = {},
): Promise<SupplierPackage[]> {
  if (useMock()) return mockPackageList(params);
  const obj = await accessPost<{ packageList?: RawPackage[] }>("/package/list", params);
  return (obj?.packageList || []).map((p) => ({
    packageCode: p.packageCode || "",
    slug: p.slug || "",
    name: p.name || "",
    price: (p.price ?? 0) / 10000,
    currencyCode: p.currencyCode || "USD",
    volume: p.volume ?? 0,
    unusedValidTime: p.unusedValidTime ?? 0,
    duration: p.duration ?? 0,
    durationUnit: p.durationUnit || "DAY",
    location: p.location || "",
    description: p.description || "",
    activeType: p.activeType ?? 1,
    supportTopUpType: p.supportTopUpType ?? 1,
    dataType: p.dataType ?? 1,
    speed: p.speed || "",
  }));
}

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

type EsimRow = {
  orderNo?: string;
  esimTranNo?: string;
  iccid?: string;
  ac?: string;
  smdpAddress?: string;
  matchingId?: string;
  qrCodeUrl?: string;
  shortUrl?: string;
};

type OrderObj = {
  orderNo?: string;
  esimList?: EsimRow[];
};

type QueryObj = {
  esimList?: EsimRow[];
};

function toProfile(orderNo: string, row: EsimRow): EsimProfile {
  const smdp = row.smdpAddress || "";
  const matchingId = row.matchingId || "";
  const activation =
    row.ac ||
    (smdp && matchingId ? `LPA:1$${smdp}$${matchingId}` : "");
  return {
    supplierOrderNo: orderNo,
    esimTranNo: row.esimTranNo || "",
    iccid: row.iccid || "",
    smdpAddress: smdp,
    matchingId,
    activationCode: activation,
  };
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function orderEsimProfile(params: {
  packageCode: string;
  periodNum?: number;
  transactionId: string;
  count?: number;
}): Promise<EsimProfile> {
  if (useMock()) {
    return mockOrderEsimProfile(params);
  }

  const amountCount = params.count ?? 1;
  const body: Record<string, unknown> = {
    transactionId: params.transactionId,
    amount: amountCount,
    packageInfoList: [
      {
        packageCode: params.packageCode,
        count: amountCount,
        ...(params.periodNum ? { periodNum: params.periodNum } : {}),
      },
    ],
  };

  // Newer batch order shape; fall back to legacy single-order body if needed.
  let orderNo = "";
  try {
    const ordered = await accessPost<OrderObj>("/esim/order", body);
    orderNo = ordered?.orderNo || "";
    const first = ordered?.esimList?.[0];
    if (first?.iccid || first?.ac) {
      return toProfile(orderNo, first);
    }
  } catch {
    const legacy = await accessPost<OrderObj>("/esim/order", {
      packageCode: params.packageCode,
      periodNum: params.periodNum,
      transactionId: params.transactionId,
    });
    orderNo = legacy?.orderNo || "";
    const first = legacy?.esimList?.[0];
    if (first?.iccid || first?.ac) {
      return toProfile(orderNo, first);
    }
  }

  // Poll query until profile allocated. Live deployments should also register
  // the webhook (see registerWebhook) so ORDER_STATUS callbacks cover slow allocations.
  for (let i = 0; i < 8; i++) {
    await sleep(1500);
    const q = await accessPost<QueryObj>("/esim/query", { orderNo });
    const row = q?.esimList?.[0];
    if (row?.iccid || row?.ac) {
      return toProfile(orderNo || row.orderNo || params.transactionId, row);
    }
  }

  throw new Error("Timed out waiting for eSIM profile from Access");
}

export async function queryEsim(orderNo: string) {
  if (useMock()) return null;
  return accessPost<QueryObj>("/esim/query", { orderNo });
}

// ---------------------------------------------------------------------------
// Lifecycle operations (topup / cancel / suspend / revoke)
// ---------------------------------------------------------------------------

type EsimRef = { esimTranNo?: string; iccid?: string };

function refBody(ref: EsimRef): Record<string, unknown> {
  // The API prefers esimTranNo; iccid is accepted as fallback.
  if (ref.esimTranNo) return { esimTranNo: ref.esimTranNo };
  if (ref.iccid) return { iccid: ref.iccid };
  throw new Error("esimTranNo or iccid required");
}

export async function topUpEsim(params: EsimRef & {
  packageCode: string;
  transactionId: string;
}): Promise<LifecycleResult & { topUpTranNo?: string }> {
  if (useMock()) return mockTopUpEsim(params);
  const obj = await accessPost<{ topUpTranNo?: string }>("/esim/topup", {
    ...refBody(params),
    packageCode: params.packageCode,
    transactionId: params.transactionId,
  });
  return { success: true, topUpTranNo: obj?.topUpTranNo };
}

/** Cancel an unused profile; supplier refunds the package cost to our balance. */
export async function cancelEsim(params: EsimRef): Promise<LifecycleResult> {
  if (useMock()) return mockCancelEsim(params);
  await accessPost("/esim/cancel", refBody(params));
  return { success: true };
}

export async function suspendEsim(params: EsimRef): Promise<LifecycleResult> {
  if (useMock()) return mockSuspendEsim(params);
  await accessPost("/esim/suspend", refBody(params));
  return { success: true };
}

export async function unsuspendEsim(params: EsimRef): Promise<LifecycleResult> {
  if (useMock()) return mockUnsuspendEsim(params);
  await accessPost("/esim/unsuspend", refBody(params));
  return { success: true };
}

/** Permanently remove an installed profile (no refund). */
export async function revokeEsim(params: EsimRef): Promise<LifecycleResult> {
  if (useMock()) return mockRevokeEsim(params);
  await accessPost("/esim/revoke", refBody(params));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

type RawUsage = {
  esimList?: Array<{
    esimTranNo?: string;
    iccid?: string;
    totalVolume?: number; // bytes
    orderUsage?: number; // bytes
  }>;
};

const GB = 1024 * 1024 * 1024;

export async function usageQuery(params: EsimRef & { planGb?: number }): Promise<EsimUsage | null> {
  if (useMock()) return mockUsageQuery(params);
  const obj = await accessPost<RawUsage>("/esim/usage/query", refBody(params));
  const row = obj?.esimList?.[0];
  if (!row) return null;
  const totalGb = Math.round(((row.totalVolume ?? 0) / GB) * 100) / 100;
  const usedGb = Math.round(((row.orderUsage ?? 0) / GB) * 100) / 100;
  return {
    esimTranNo: row.esimTranNo || params.esimTranNo || "",
    iccid: row.iccid || params.iccid || "",
    totalGb,
    usedGb,
    remainingGb: Math.max(0, Math.round((totalGb - usedGb) * 100) / 100),
    lastUpdated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Webhook registration
// ---------------------------------------------------------------------------

/** Register the URL eSIM Access should POST ORDER_STATUS / SMDP / usage events to. */
export async function registerWebhook(url: string): Promise<LifecycleResult> {
  if (useMock()) return mockSaveWebhook(url);
  await accessPost("/webhook/save", { webhook: url });
  return { success: true };
}

export async function queryWebhook(): Promise<{ webhook: string }> {
  if (useMock()) return mockQueryWebhook();
  const obj = await accessPost<{ webhook?: string }>("/webhook/query", {});
  return { webhook: obj?.webhook || "" };
}

export type { EsimProfile, EsimUsage, LifecycleResult, SupplierPackage };
