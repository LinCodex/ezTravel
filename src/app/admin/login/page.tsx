"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/admin/orders");
      router.refresh();
    } else {
      setError("invalid username or password");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <form
        onSubmit={login}
        className="bg-neutral-900/80 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Logo className="h-5 w-5" />
          <span className="text-white text-sm">
            eztravel <span className="text-white/40">master panel</span>
          </span>
        </div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          autoComplete="username"
          className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoComplete="current-password"
          className="w-full bg-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/30"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {loading ? "signing in..." : "sign in"}
        </button>
      </form>
    </main>
  );
}
