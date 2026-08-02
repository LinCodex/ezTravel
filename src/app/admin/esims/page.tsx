import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "../AdminShell";
import { EsimsConsole } from "./EsimsConsole";

export const dynamic = "force-dynamic";

export default async function AdminEsimsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return (
    <AdminShell>
      <EsimsConsole />
    </AdminShell>
  );
}
