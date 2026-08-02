import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { CustomersDirectory } from "./CustomersDirectory";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <AdminShell>
      <CustomersDirectory />
    </AdminShell>
  );
}
