/**
 * Payment gateway interface. Current implementations are mock Square +
 * manual Zelle/WeChat confirmation. A real Stripe/Square adapter can drop
 * in by implementing PaymentGateway — see docs/backend-overhaul.md.
 */

export type PaymentMethod = "SQUARE" | "ZELLE" | "WECHAT";

export type ChargeResult =
  | { ok: true; providerRef: string; mock: boolean }
  | { ok: false; error: string };

export interface PaymentGateway {
  id: string;
  /** Charge a card (or simulate). Manual methods return ok immediately for "submitted". */
  charge(params: {
    amountUsd: number;
    orderRef: string;
    email: string;
    method: PaymentMethod;
  }): Promise<ChargeResult>;
}

/** Mock Square — accepts any card payload after a short delay. */
export const mockSquareGateway: PaymentGateway = {
  id: "square-mock",
  async charge({ orderRef, method }) {
    if (method !== "SQUARE") {
      return { ok: false, error: "Square gateway only handles SQUARE" };
    }
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true, providerRef: `sq_mock_${orderRef}`, mock: true };
  },
};

/** Manual payment — no charge; admin confirms later. */
export const manualPaymentGateway: PaymentGateway = {
  id: "manual",
  async charge({ orderRef, method }) {
    if (method !== "ZELLE" && method !== "WECHAT") {
      return { ok: false, error: "Manual gateway only handles ZELLE/WECHAT" };
    }
    return { ok: true, providerRef: `manual_${method.toLowerCase()}_${orderRef}`, mock: true };
  },
};

export function gatewayFor(method: PaymentMethod): PaymentGateway {
  if (method === "SQUARE") return mockSquareGateway;
  return manualPaymentGateway;
}
