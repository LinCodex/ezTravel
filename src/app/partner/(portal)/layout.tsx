import "@/app/partner/partner.css";
import { PartnerShellWithCart } from "@/components/partner/PartnerShellWithCart";
import { requirePartner } from "@/lib/partner/require";

export default async function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  const { public: partner } = await requirePartner();
  return <PartnerShellWithCart partner={partner}>{children}</PartnerShellWithCart>;
}
