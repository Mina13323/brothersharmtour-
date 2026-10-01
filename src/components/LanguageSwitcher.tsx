"use client";

/**
 * Language switcher — switches CONTENT language via a server-read cookie
 * (`bt_lang`). Only languages the admin has enabled AND that have real,
 * human-written translations appear. This is deliberately NOT machine
 * translation: untranslated content falls back to English rather than being
 * auto-translated. Currency is unaffected — it has its own switcher.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSite } from "./SiteProvider";

const FLAGS: Record<string, string> = {
  en: "🇬🇧",
  ar: "🇪🇬",
  fr: "🇫🇷",
  de: "🇩🇪",
  ru: "🇷🇺",
  it: "🇮🇹",
  pl: "🇵🇱",
  ro: "🇷🇴",
  nl: "🇳🇱",
  uk: "🇺🇦",
};

export function LanguageSwitcher({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const { settings } = useSite();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  const enabled = settings.languages.filter((l) => l.enabled);

  useEffect(() => {
    const stored = document.cookie
      .split("; ")
      .find((c) => c.startsWith("bt_lang="))
      ?.split("=")[1];
    setCurrent(stored ?? "en");
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(code: string) {
    setCurrent(code);
    setOpen(false);
    document.cookie = `bt_lang=${code}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
    document.documentElement.lang = code;
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    router.refresh();
  }

  if (enabled.length <= 1) return null;

  const active = enabled.find((l) => l.code === current) ?? enabled[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition-colors",
          tone === "light"
            ? "text-white/90 hover:bg-white/10"
            : "text-ink hover:bg-ink/5",
        )}
      >
        <Globe className="size-4" />
        <span aria-hidden>{FLAGS[active.code] ?? "🌐"}</span>
        <span className="hidden sm:inline">{active.code.toUpperCase()}</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-sand bg-paper py-1.5 shadow-lg"
        >
          {enabled.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === current}
                onClick={() => choose(l.code)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2 text-left text-[0.85rem] transition-colors",
                  l.code === current
                    ? "bg-paper-warm font-semibold text-ink"
                    : "text-stone hover:bg-paper-warm/60",
                )}
              >
                <span aria-hidden>{FLAGS[l.code] ?? "🌐"}</span>
                {l.label}
              </button>
            </li>
          ))}
          <li className="mt-1 border-t border-sand/70 px-4 py-2 text-[0.68rem] leading-relaxed text-stone">
            Content shows translated fields where we have them; everything else
            stays in English.
          </li>
        </ul>
      ) : null}
    </div>
  );
}
