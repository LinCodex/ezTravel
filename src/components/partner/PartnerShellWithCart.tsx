"use client";

import { PartnerShell, type PartnerMe } from "./PartnerShell";
import { PartnerCartProvider, usePartnerCart } from "./PartnerCartProvider";

function ShellInner({ partner, children }: { partner: PartnerMe; children: React.ReactNode }) {
  const { count } = usePartnerCart();
  return (
    <PartnerShell partner={partner} cartCount={count}>
      {children}
    </PartnerShell>
  );
}

export function PartnerShellWithCart({
  partner,
  children,
}: {
  partner: PartnerMe;
  children: React.ReactNode;
}) {
  return (
    <PartnerCartProvider>
      <ShellInner partner={partner}>{children}</ShellInner>
    </PartnerCartProvider>
  );
}
