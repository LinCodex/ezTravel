import { redirect } from "next/navigation";
import { getAuthenticatedPartner, publicPartner } from "@/lib/partner/auth";

export async function requirePartner() {
  const partner = await getAuthenticatedPartner();
  if (!partner) redirect("/partner/login");
  return { partner, public: publicPartner(partner) };
}
