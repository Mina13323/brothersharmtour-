"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Language switcher — mirrors the EN / RU / IT / TR selector on the reference
 * site. English is fully live; the other three are wired into the UI and marked
 * as rolling out, so the control is honest rather than showing half-translated
 * pages. When full localisation lands, swap the `ready` flags and point each
 * option at its locale route.
 */
const languages = [
  { code: "en", label: "English", native: "English", ready: true },
  { code: "ru", label: "Russian", native: "Русский", ready: false },
  { code: "it", label: "Italian", native: "Italiano", ready: false },
  { code: "tr", label: "Turkish", native: "Türkçe", ready: false },
];

export function LanguageSwitcher({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const [notice, setNotice] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("bst-lang");
    if (saved) setCurrent(saved);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (code: string, ready: boolean, native: string) => {
    if (!ready) {
      setNotice(`${native} is coming soon — showing English for now.`);
      setOpen(false);
      window.setTimeout(() => setNotice(null), 3200);
      return;
    }
    setCurrent(code);
    localStorage.setItem("bst-lang", code);
    document.documentElement.lang = code;
    setOpen(false);
  };

  const active = languages.find((l) => l.code === current) ?? languages[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-pill border px-3 text-[0.8rem] font-medium transition-colors",
          tone === "light"
            ? "border-white/30 text-white hover:bg-white/10"
            : "border-ink/15 text-ink hover:bg-paper-warm",
        )}
      >
        <GlobeIcon />
        <span className="uppercase tracking-[0.04em]">{active.code}</span>
        <svg
          width="9"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-card border border-sand bg-paper py-1 shadow-xl"
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current}
                onClick={() => select(lang.code, lang.ready, lang.native)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-[0.875rem] transition-colors hover:bg-paper-warm",
                  lang.code === current && "font-semibold text-reef-deep",
                )}
              >
                <span>{lang.native}</span>
                {lang.ready ? (
                  lang.code === current ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M2 7.5l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null
                ) : (
                  <span className="rounded-pill bg-sand/60 px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.06em] text-stone">
                    Soon
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {notice ? (
        <p className="absolute right-0 top-full z-50 mt-2 w-56 rounded-card border border-sand bg-paper px-3 py-2 text-[0.78rem] text-stone shadow-lg">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 10h16M10 2c2.5 2.2 2.5 13.8 0 16M10 2c-2.5 2.2-2.5 13.8 0 16"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
