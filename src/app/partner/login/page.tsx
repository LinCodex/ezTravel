"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import "@/app/partner/partner.css";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/partner/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/partner");
    router.refresh();
  }

  return (
    <div className="partner-root flex min-h-screen items-center justify-center px-4">
      <div className="pp-card w-full max-w-md p-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--pp-muted)]">
          ezTravel
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Partner sign in</h1>
        <p className="mt-2 text-sm text-[var(--pp-muted)]">
          Access is by invitation only. Contact support if you need an account.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="pp-label mb-0">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pp-input mt-1"
            />
          </label>
          <label className="pp-label mb-0">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pp-input mt-1"
            />
          </label>
          {error && <p className="text-sm text-[var(--pp-danger)]">{error}</p>}
          <button type="submit" disabled={loading} className="pp-btn pp-btn-primary w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
