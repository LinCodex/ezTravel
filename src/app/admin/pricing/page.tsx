import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { PricingManager } from "./PricingManager";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell>
      <PricingManager />
    </AdminShell>
  );
}
