/**
 * Mock eSIM provisioning client, mirroring the eSIMAccess Open API surface:
 *   order/query, topup, cancel, suspend/unsuspend, revoke, usage, package list.
 *
 * The real client in access-client.ts delegates here when mock mode is on
 * (ESIMACCESS_USE_MOCK=1 or no access code configured). Keeping the mock at
 * full parity means every admin/partner feature is exercisable locally and
 * the live switch is env-only.
 */

import { prisma } from "@/lib/db";

export interface EsimProfile {
  supplierOrderNo: string;
  /** Per-profile supplier transaction number — primary key for lifecycle ops + webhooks. */
  esimTranNo: string;
  iccid: string;
  smdpAddress: string;
  matchingId: string;
  /** Full LPA activation string, encodable as a QR code. */
  activationCode: string;
}

export type EsimUsage = {
  esimTranNo: string;
  iccid: string;
  totalGb: number;
  usedGb: number;
  remainingGb: number;
  lastUpdated: string;
};

export type LifecycleResult = {
  success: boolean;
  message?: string;
};

/** Shape of a supplier catalog entry (subset of eSIM Access /package/list). */
export type SupplierPackage = {
  packageCode: string;
  slug: string;
  name: string;
  price: number; // USD
  currencyCode: string;
  volume: number; // bytes
  unusedValidTime: number;
  duration: number;
  durationUnit: string;
  location: string;
  description: string;
  activeType: number;
  supportTopUpType: number;
  dataType: number;
  speed: string;
};

function randomDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function randomToken(n: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/** Deterministic 0..1 fraction from a string, so mock usage is stable per eSIM. */
function hashFraction(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export async function orderEsimProfile(params: {
  packageCode: string;
  periodNum?: number;
  transactionId: string;
}): Promise<EsimProfile> {
  // Simulates ordering + polling for the allocated profile.
  void params;
  const smdpAddress = "rsp.esimaccess.mock";
  const matchingId = `${randomToken(4)}-${randomToken(6)}-${randomToken(6)}`;
  return {
    supplierOrderNo: `B${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${randomDigits(8)}`,
    esimTranNo: `T${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${randomDigits(10)}`,
    iccid: `89852${randomDigits(14)}`,
    smdpAddress,
    matchingId,
    activationCode: `LPA:1$${smdpAddress}$${matchingId}`,
  };
}

export async function mockTopUpEsim(params: {
  esimTranNo?: string;
  iccid?: string;
  packageCode: string;
  transactionId: string;
}): Promise<LifecycleResult & { topUpTranNo: string }> {
  void params;
  return { success: true, topUpTranNo: `TU${randomDigits(12)}`, message: "Mock top-up applied" };
}

export async function mockCancelEsim(params: {
  esimTranNo?: string;
  iccid?: string;
}): Promise<LifecycleResult> {
  void params;
  return { success: true, message: "Mock profile cancelled; supplier balance refunded" };
}

export async function mockSuspendEsim(params: {
  esimTranNo?: string;
  iccid?: string;
}): Promise<LifecycleResult> {
  void params;
  return { success: true, message: "Mock profile suspended" };
}

export async function mockUnsuspendEsim(params: {
  esimTranNo?: string;
  iccid?: string;
}): Promise<LifecycleResult> {
  void params;
  return { success: true, message: "Mock profile unsuspended" };
}

export async function mockRevokeEsim(params: {
  esimTranNo?: string;
  iccid?: string;
}): Promise<LifecycleResult> {
  void params;
  return { success: true, message: "Mock profile revoked" };
}

export async function mockUsageQuery(params: {
  esimTranNo?: string;
  iccid?: string;
  planGb?: number;
}): Promise<EsimUsage> {
  const key = params.esimTranNo || params.iccid || "unknown";
  const totalGb = params.planGb && params.planGb > 0 ? params.planGb : 1;
  // Stable 5%..85% consumption per eSIM so demos look real but don't jump around.
  const usedFraction = 0.05 + hashFraction(key) * 0.8;
  const usedGb = Math.round(totalGb * usedFraction * 100) / 100;
  return {
    esimTranNo: params.esimTranNo || "",
    iccid: params.iccid || "",
    totalGb,
    usedGb,
    remainingGb: Math.max(0, Math.round((totalGb - usedGb) * 100) / 100),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Mock supplier catalog: mirrors the current Plan table shaped like
 * /package/list responses. Makes catalog sync a safe no-op rehearsal locally.
 */
export async function mockPackageList(params: { locationCode?: string } = {}): Promise<SupplierPackage[]> {
  const plans = await prisma.plan.findMany({
    where: params.locationCode ? { regionCode: params.locationCode } : undefined,
    orderBy: [{ region: "asc" }, { name: "asc" }],
  });
  return plans.map((p) => ({
    packageCode: p.id,
    slug: p.slug,
    name: p.name,
    price: p.costUsd,
    currencyCode: "USD",
    volume: Math.round(p.gb * 1024 * 1024 * 1024),
    unusedValidTime: 180,
    duration: p.validityDays,
    durationUnit: "DAY",
    location: p.regionCode,
    description: p.coverage || p.region,
    activeType: 1,
    supportTopUpType: p.topUpType === "Data Reloadable" ? 2 : 1,
    dataType: p.dataType === "Daily Unlimited" ? 2 : 1,
    speed: p.speed || "4G/5G",
  }));
}

export type MockWebhookConfig = { webhook: string };
let mockWebhookUrl = "";

export async function mockSaveWebhook(url: string): Promise<LifecycleResult> {
  mockWebhookUrl = url;
  return { success: true, message: `Mock webhook registered: ${url}` };
}

export async function mockQueryWebhook(): Promise<MockWebhookConfig> {
  return { webhook: mockWebhookUrl };
}
