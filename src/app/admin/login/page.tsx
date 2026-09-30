"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        localStorage.setItem("bro_admin_auth", "true");
        router.push("/admin");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Instant direct access bypass if user hasn't yet created Supabase auth user
  const handleDirectAccess = () => {
    localStorage.setItem("bro_admin_auth", "true");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#070e10] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md">
        {/* Header / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-4 shadow-lg shadow-teal-500/10">
            <Shield className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Brother Sharm Admin CMS
          </h1>
          <p className="text-sm text-stone-400 mt-1.5">
            Manage tours, pricing, custom packages & guest bookings
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#0e191c] border border-white/10 p-7 shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="size-5 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="size-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brothersharm.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="size-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign in to Dashboard"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Quick Access Helper */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-stone-400 mb-3">
              Testing or first time setting up?
            </p>
            <button
              type="button"
              onClick={handleDirectAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="size-4 text-teal-400" />
              Quick Admin Access (Bypass)
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
