import Link from "next/link";

export default function PartnerHelpPage() {
  const faqs = [
    {
      q: "How do I top up my partner balance?",
      a: "Go to Billing, choose Zelle, Venmo, WeChat, or Cash, submit the amount, then send payment. Master admin verifies receipt and credits your balance.",
    },
    {
      q: "How is partner wholesale priced?",
      a: "Each plan is Access cost + 50% markup, plus sales tax estimated from your store ZIP’s US state rate.",
    },
    {
      q: "What does Suggested Retail mean?",
      a: "It is your wholesale unit price increased by the retail markup % in Settings. Change that percentage anytime — no approval needed.",
    },
    {
      q: "How do customers receive eSIMs?",
      a: "After checkout, a branded delivery page is created at /p/{your-alias}/order/{orderId}. You can also create QuickShare links from Orders or eSIMs.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold">Help & Support</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="pp-card flex flex-col p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--pp-blue-soft)] text-xl text-[var(--pp-blue)]">
            ▣
          </div>
          <h2 className="mt-4 text-lg font-semibold">eSIM Troubleshooting</h2>
          <p className="mt-2 flex-1 text-sm text-[var(--pp-muted)]">
            Billing help, FAQs, and guidance for activating or sharing partner eSIMs.
          </p>
          <a href="#faqs" className="pp-btn pp-btn-secondary mt-5 self-start">
            Go to eSIM Help Center
          </a>
        </article>
        <article className="pp-card flex flex-col p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--pp-blue-soft)] text-xl text-[var(--pp-blue)]">
            ✉
          </div>
          <h2 className="mt-4 text-lg font-semibold">Send Feedback</h2>
          <p className="mt-2 flex-1 text-sm text-[var(--pp-muted)]">
            Share opinions or report issues with the partner portal experience.
          </p>
          <Link href="/partner/support" className="pp-btn pp-btn-secondary mt-5 self-start">
            Send Feedback
          </Link>
        </article>
      </div>

      <section id="faqs" className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pp-muted)]">FAQs</h2>
        {faqs.map((f) => (
          <details key={f.q} className="pp-card px-5 py-4">
            <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
            <p className="mt-3 text-sm text-[var(--pp-muted)]">{f.a}</p>
          </details>
        ))}
      </section>

      <Link
        href="/partner/support"
        className="pp-btn pp-btn-primary fixed right-6 bottom-6 z-40 shadow-lg"
      >
        ? Support
      </Link>
    </div>
  );
}
