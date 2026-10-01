"use client";

/**
 * Display-currency switcher. Sets the `bt_currency` cookie (validated
 * server-side against the admin's rate table) and refreshes so every price on
 * the page re-renders in the chosen currency. Independent of language.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSite } from "./SiteProvider";

const SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  EGP: "E£",
};

export function CurrencySwitcher({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const { currency } = useSite();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const codes = Object.keys(currency.rates);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function choose(code: string) {
    setOpen(false);
    if (code === currency.display || busy) return;
    setBusy(true);
    try {
      await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: code }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (codes.length <= 1) return null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change currency"
        disabled={busy}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition-colors",
          tone === "light"
            ? "text-white/90 hover:bg-white/10"
            : "text-ink hover:bg-ink/5",
          busy && "opacity-60",
        )}
      >
        <span aria-hidden>{SYMBOLS[currency.display] ?? ""}</span>
        <span>{currency.display}</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-2xl border border-sand bg-paper py-1.5 shadow-lg"
        >
          {codes.map((code) => (
            <li key={code}>
              <button
                role="option"
                aria-selected={code === currency.display}
                onClick={() => choose(code)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2 text-left text-[0.85rem] transition-colors",
                  code === currency.display
                    ? "bg-paper-warm font-semibold text-ink"
                    : "text-stone hover:bg-paper-warm/60",
                )}
              >
                <span aria-hidden className="w-5">
                  {SYMBOLS[code] ?? ""}
                </span>
                {code}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
