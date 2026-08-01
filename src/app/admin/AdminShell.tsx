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
    { href: "/admin/orders", label: "orders" },
    { href: "/admin/pricing", label: "pricing" },
  ];

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-4 w-4" />
            <span className="text-white text-sm">
              eztravel <span className="text-white/40">master panel</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-4 py-1.5 rounded-full transition-colors ${
                  pathname.startsWith(l.href)
                    ? "bg-white text-black"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={logout}
          className="text-neutral-400 hover:text-white transition-colors text-sm"
        >
          log out
        </button>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
