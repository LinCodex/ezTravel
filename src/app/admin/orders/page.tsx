import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { OrdersTable } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell>
      <Suspense fallback={<div className="text-white/40 text-sm py-10 text-center">Loading…</div>}>
        <OrdersTable />
      </Suspense>
    </AdminShell>
  );
}
