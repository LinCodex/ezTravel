/**
 * Mock eSIM provisioning client, mirroring the eSIMAccess open API flow:
 *   1. POST /api/v1/open/esim/order   { packageCode, periodNum, transactionId } -> { orderNo }
 *   2. POST /api/v1/open/esim/query   { orderNo } -> allocated profiles (iccid, ac, smdp)
 *
 * Swap this module for a real client later; the interface stays the same.
 */

export interface EsimProfile {
  supplierOrderNo: string;
  iccid: string;
  smdpAddress: string;
  matchingId: string;
  /** Full LPA activation string, encodable as a QR code. */
  activationCode: string;
}

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
    iccid: `89852${randomDigits(14)}`,
    smdpAddress,
    matchingId,
    activationCode: `LPA:1$${smdpAddress}$${matchingId}`,
  };
}
