import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "./AdminShell";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <AdminShell>
      <DashboardClient />
    </AdminShell>
  );
}
