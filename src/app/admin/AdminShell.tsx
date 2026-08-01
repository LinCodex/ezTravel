"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const links = [
    { href: "/admin/orders", label: "Orders & CRM" },
    { href: "/admin/pricing", label: "Pricing & Plans" },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="h-4 w-4" />
              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight">
                ezTravel <span className="text-white/40 font-normal">Admin</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-full transition-all whitespace-nowrap font-medium ${
                    pathname.startsWith(l.href)
                      ? "bg-white text-black shadow-md"
                      : "text-neutral-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={logout}
            className="text-neutral-400 hover:text-white transition-colors text-xs sm:text-sm px-2 py-1"
          >
            Log Out
          </button>
        </div>
      </header>
      <main className="px-4 py-5 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
