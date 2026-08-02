"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function SupportClient() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+1-555-0100";
  const sms = process.env.NEXT_PUBLIC_SUPPORT_SMS || phone;
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "partners@eztravel.example";
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("General");
  const [status, setStatus] = useState("");

  async function send(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/partner/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `[${topic}] ${message}` }),
    });
    if (!res.ok) {
      setStatus("Could not send feedback.");
      return;
    }
    setMessage("");
    setStatus("Thanks — feedback sent. We’ll follow up by email.");
  }

  const channels = [
    {
      label: "Text / SMS",
      value: sms,
      href: `sms:${sms}`,
      desc: "Fastest for activation or checkout blockers.",
      icon: "💬",
    },
    {
      label: "Phone",
      value: phone,
      href: `tel:${phone}`,
      desc: "Speak with partner support during business hours.",
      icon: "📞",
    },
    {
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      desc: "Best for billing invoices, account changes, and docs.",
      icon: "✉",
    },
  ];

  const topics = [
    { title: "Billing & balance", body: "Top-up verification usually completes after payment is confirmed in the master portal." },
    { title: "Company details", body: "Name, email, and ZIP changes are handled manually — include your brand alias in the request." },
    { title: "Provisioning issues", body: "Send the order ID / ICCID and we’ll check Access allocation status." },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="pp-hero px-6 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Support</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Reach the ezTravel partner team for billing, branding, and eSIM delivery help.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`sms:${sms}`}
            className="pp-btn pp-btn-primary"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Text us
          </a>
          <Link href="/partner/help" className="pp-btn pp-btn-secondary">
            Browse FAQs
          </Link>
          <Link href="/partner/billing" className="pp-btn pp-btn-secondary">
            Billing
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="pp-card flex flex-col p-5 transition hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-lg">
              {c.icon}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {c.label}
            </div>
            <div className="mt-1 break-all text-sm font-semibold">{c.value}</div>
            <p className="mt-2 flex-1 text-xs text-white/45">{c.desc}</p>
            <span className="pp-btn pp-btn-secondary mt-4 self-start">Contact</span>
          </a>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="pp-card space-y-3 p-5">
          <h2 className="text-sm font-semibold">Common partner topics</h2>
          {topics.map((t) => (
            <div key={t.title} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-sm font-semibold">{t.title}</div>
              <p className="mt-1 text-xs text-white/45">{t.body}</p>
            </div>
          ))}
        </section>

        <form onSubmit={send} className="pp-card space-y-3 p-5">
          <h2 className="text-sm font-semibold">Send feedback</h2>
          <p className="text-xs text-white/40">Ideas, bugs, or requests — we read every note.</p>
          <div className="flex flex-wrap gap-2">
            {["General", "Billing", "Store", "Delivery", "Brand"].map((t) => (
              <button
                key={t}
                type="button"
                className={`pp-chip ${topic === t ? "pp-chip-active" : ""}`}
                onClick={() => setTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Describe what you need…"
            className="pp-input"
          />
          <button type="submit" className="pp-btn pp-btn-accent">
            Submit feedback
          </button>
          {status && <p className="text-sm text-[var(--pp-success)]">{status}</p>}
        </form>
      </div>
    </div>
  );
}
