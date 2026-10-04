"use client";

import { useState } from "react";
import { Database, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export function DatabaseSyncWidget() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  async function handleSync() {
    setLoading(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/admin/sync-supabase", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({
          type: "error",
          message: data.error || "Failed to sync to database.",
        });
      } else {
        setStatus({
          type: "success",
          message: data.message || "All content successfully synchronized to database!",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: (err as Error).message || "Network error while syncing.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#101c1f] border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Database className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Database Sync (Supabase)</h2>
            <p className="text-xs text-stone-400">
              Synchronize tours, packages, child pricing &amp; translations to the persistent Supabase database.
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl px-4 py-2.5 transition-colors"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Syncing to Database..." : "Sync All CMS to Database"}
        </button>
      </div>

      {status.type === "success" && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{status.message}</span>
        </div>
      )}

      {status.type === "error" && (
        <div className="space-y-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Database synchronization issue:</p>
              <p className="mt-1">{status.message}</p>
            </div>
          </div>
          {status.message?.includes("PGRST205") || status.message?.includes("not found") ? (
            <p className="text-[11px] text-stone-400 pl-6">
              👉 Go to your Supabase Dashboard → <strong>SQL Editor</strong> and execute the SQL file:{" "}
              <code className="text-teal-300">supabase/schema.sql</code>. Once executed, click sync again!
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
