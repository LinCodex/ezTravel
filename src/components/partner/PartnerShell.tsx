"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type PartnerMe = {
  id: string;
  email: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  status: string;
  role: string;
  balanceUsd: number;
  brandName: string;
  brandAlias: string;
};

const NAV = [
  { href: "/partner", label: "Home", exact: true },
  { href: "/partner/store", label: "eSIMs store" },
  { href: "/partner/esims", label: "eSIMs" },
  { href: "/partner/orders", label: "Orders" },
  { href: "/partner/billing", label: "Billing" },
  { href: "/partner/analytics", label: "Analytics" },
  { href: "/partner/help", label: "Help" },
  { href: "/partner/support", label: "Support" },
  { href: "/partner/settings", label: "Settings" },
];

export function PartnerShell({
  partner,
  cartCount = 0,
  children,
}: {
  partner: PartnerMe;
  cartCount?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    // On small screens start collapsed; desktop open
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setSidebarOpen(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  async function logout() {
    await fetch("/api/partner/logout", { method: "POST" });
    router.push("/partner/login");
    router.refresh();
  }

  const displayName =
    `${partner.contactFirstName} ${partner.contactLastName}`.trim() || partner.email;
  const storeName = partner.brandName || partner.companyName;

  return (
    <div className="partner-root">
      <div className="flex min-h-screen">
        <aside
          className={`pp-shell-aside relative z-40 w-64 shrink-0 ${
            sidebarOpen ? "" : "pp-aside-collapsed"
          }`}
          aria-hidden={!sidebarOpen}
        >
          <div className="flex h-full w-64 flex-col border-r border-white/10">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                ezTravel
              </div>
              <div className="mt-1 text-sm font-semibold">Partner Platform</div>
            </div>
            <nav className="pp-scroll flex-1 space-y-1 overflow-auto p-3">
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`pp-btn pp-btn-rect pp-nav-link w-full justify-start px-3 py-2.5 text-sm font-medium ${
                      active ? "pp-nav-active" : ""
                    }`}
                    tabIndex={sidebarOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="pp-shell-header sticky top-0 z-30">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className={`pp-toggle-arrow ${sidebarOpen ? "" : "pp-toggle-open"}`}
                  aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
                  aria-expanded={sidebarOpen}
                  onClick={() => setSidebarOpen((v) => !v)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M14.5 6L8.5 12L14.5 18"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-tight">{storeName}</div>
                  <div className="text-xs text-white/40">Balance ${partner.balanceUsd.toFixed(2)} USD</div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <Link href="/partner/cart" className="pp-btn pp-btn-accent whitespace-nowrap">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                </Link>

                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="pp-btn pp-btn-secondary gap-2 py-1 pr-3 pl-1"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-xs text-white/80 sm:block">
                      {displayName}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="pp-menu right-0 mt-2 w-64 p-3">
                      <div className="px-2 pb-3">
                        <div className="text-sm font-semibold">{displayName}</div>
                        <div className="mt-0.5 break-all text-xs text-white/45">{partner.email}</div>
                        <div className="mt-2 flex gap-2">
                          <span className="pp-badge pp-badge-green">{partner.status}</span>
                          <span className="pp-badge pp-badge-gray">{partner.role}</span>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-1">
                        <Link
                          href="/partner/settings"
                          onClick={() => setProfileOpen(false)}
                          className="pp-menu-item"
                        >
                          Company settings
                        </Link>
                        <button type="button" onClick={logout} className="pp-menu-item text-red-300">
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
