"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock, Mail } from "lucide-react";

/**
 * Admin sign-in. Posts to /api/admin/auth which rate limits attempts and sets
 * an HttpOnly session cookie. There is no demo mode, no localStorage flag and
 * no bypass — the seed credentials must be changed from Settings on first use.
 */

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Sign-in failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1214] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-4">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            BROTHER SHARM TOUR
          </h1>
          <p className="text-xs text-teal-400 font-medium tracking-wider uppercase mt-1">
            Admin Portal
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-[#0d1618] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl"
        >
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                placeholder="admin@brothersharmtour.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                placeholder="••••••••••"
              />
            </div>
          </div>

          {error ? (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-[11px] text-stone-500 text-center leading-relaxed pt-1">
            Sign-in is rate limited. Sessions expire automatically and are
            invalidated when the admin password changes.
          </p>
        </form>
      </div>
    </div>
  );
}
