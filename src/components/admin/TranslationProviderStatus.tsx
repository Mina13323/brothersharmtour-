"use client";

import { useEffect, useState } from "react";

type Status = {
  active: { label: string; model: string } | null;
  providers: {
    id: string;
    label: string;
    configured: boolean;
    cooldown: { reason: string; minutesLeft: number } | null;
  }[];
};

/** One-line view of which translation provider is in use and who is cooling down (and why). */
export function TranslationProviderStatus({ refreshKey }: { refreshKey?: unknown }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/translate/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d?.ok && setStatus(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  if (!status) return null;
  const cooling = status.providers.filter((p) => p.configured && p.cooldown);
  const missing = status.providers.filter((p) => !p.configured);

  return (
    <p className="text-[11px] text-stone-400" data-testid="translation-provider-status">
      {status.active ? (
        <>
          Translating with <span className="font-semibold text-stone-200">{status.active.label}</span>
        </>
      ) : (
        <span className="font-semibold text-red-400">No translation provider available</span>
      )}
      {cooling.map((p) => (
        <span key={p.id} className="text-amber-400">
          {" · "}
          {p.label}: {p.cooldown!.reason} (retry in ~{p.cooldown!.minutesLeft} min)
        </span>
      ))}
      {missing.map((p) => (
        <span key={p.id} className="text-stone-500">
          {" · "}
          {p.label}: no API key
        </span>
      ))}
    </p>
  );
}
