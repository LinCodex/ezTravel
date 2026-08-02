import Link from "next/link";
import { prisma } from "@/lib/db";
import { requirePartner } from "@/lib/partner/require";

export default async function PartnerHomePage() {
  const { partner } = await requirePartner();

  const [esimCount, orders] = await Promise.all([
    prisma.partnerEsim.count({ where: { partnerId: partner.id } }),
    prisma.partnerOrder.count({ where: { partnerId: partner.id } }),
  ]);

  const cards = [
    {
      title: "Explore package offerings",
      desc: "Browse packages and pricing for 200+ destinations in the eSIM store.",
      href: "/partner/store",
      cta: "Go to eSIM store",
      badge: "New",
      icon: "↓",
    },
    {
      title: "Take full control of your eSIMs",
      desc: "Easily manage, share, and monitor at your fingertips.",
      href: "/partner/esims",
      cta: "Manage eSIMs",
      icon: "▣",
    },
    {
      title: "Review your orders",
      desc: "Seamlessly access, manage, and track your orders in real-time.",
      href: "/partner/orders",
      cta: "Manage orders",
      icon: "☰",
    },
    {
      title: "Receive 24/7 assistance",
      desc: "Get dedicated help and support whenever you need it.",
      href: "/partner/support",
      cta: "Help & Support",
      icon: "?",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--pp-text)]">
          Welcome to the ezTravel Partner Platform
        </h1>
        <p className="mt-1 text-sm text-[var(--pp-muted)]">
          {partner.companyName} · {esimCount} eSIMs · {orders} orders
        </p>
      </div>

      <section className="pp-hero px-6 py-8 sm:px-10 sm:py-12">
        <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          The all-in-one management tool to keep you and your users connected.
        </h2>
        <p className="mt-3 max-w-lg text-sm text-white/55">
          Browse wholesale plans, provision eSIMs, and share branded delivery pages — all from one portal.
        </p>
        <Link
          href="/partner/store"
          className="pp-btn pp-btn-primary mt-6"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          Buy eSIMs
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <article key={c.href} className="pp-card relative flex flex-col p-5">
            {c.badge && (
              <span className="pp-badge pp-badge-blue absolute top-4 right-4">{c.badge}</span>
            )}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--pp-blue-soft)] text-lg text-[var(--pp-blue)]">
              {c.icon}
            </div>
            <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm text-[var(--pp-muted)]">{c.desc}</p>
            <Link href={c.href} className="pp-btn pp-btn-secondary mt-5 self-start">
              {c.cta}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
