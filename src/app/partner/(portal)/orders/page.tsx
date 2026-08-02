import { Suspense } from "react";
import { OrdersClient } from "./OrdersClient";

export default function PartnerOrdersPage() {
  return (
    <Suspense fallback={<div className="text-sm text-white/40">Loading orders…</div>}>
      <OrdersClient />
    </Suspense>
  );
}
