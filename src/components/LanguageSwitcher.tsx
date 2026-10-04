"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSite } from "./SiteProvider";

export interface LanguageItem {
  code: string;
  label: string;
  native: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇪🇬", dir: "rtl" },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "it", label: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "pl", label: "Polish", native: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "ru", label: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "uk", label: "Ukrainian", native: "Українська", flag: "🇺🇦", dir: "ltr" },
  { code: "ro", label: "Romanian", native: "Română", flag: "🇷🇴", dir: "ltr" },
  { code: "nl", label: "Dutch", native: "Nederlands", flag: "🇳🇱", dir: "ltr" },
];

export function LanguageSwitcher({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const router = useRouter();
  const { settings, lang } = useSite();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(lang || "en");
  const ref = useRef<HTMLDivElement>(null);

  // Filter based on CMS settings if configured, otherwise all 10 supported
  const enabled = SUPPORTED_LANGUAGES.filter((item) => {
    const config = settings?.languages?.find((l) => l.code === item.code);
    return config ? config.enabled : true;
  });

  useEffect(() => {
    if (lang) {
      setCurrent(lang);
      const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      if (activeLang?.dir) {
        document.documentElement.dir = activeLang.dir;
        document.documentElement.lang = activeLang.code;
      }
    }
  }, [lang]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(code: string) {
    const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    setCurrent(code);
    setOpen(false);

    // Save preference in cookie and localStorage
    localStorage.setItem("bt_lang", code);
    document.cookie = `bt_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = code;
    document.documentElement.dir = activeLang?.dir || "ltr";

    // Clean up any obsolete Google Translate cookies that might interfere
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

    // Refresh route to re-render server components with the selected language
    router.refresh();
  }

  const active = SUPPORTED_LANGUAGES.find((l) => l.code === current) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Language Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={cn(
          "inline-flex h-8 sm:h-9 items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 text-[0.75rem] sm:text-[0.8rem] font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer",
          tone === "light"
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-sand/60 bg-paper hover:bg-paper-warm text-ink",
        )}
      >
        <Globe className="size-3 sm:size-3.5 opacity-70" />
        <span className="text-sm leading-none" aria-hidden>
          {active.flag}
        </span>
        <span className="uppercase tracking-wider text-[10px] sm:text-[11px] font-bold">
          {active.code}
        </span>
        <svg
          width="8"
          height="5"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className={cn("transition-transform duration-200 opacity-60", open && "rotate-180")}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Language Dropdown */}
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-[120] mt-2 w-48 sm:w-52 max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-sand/70 bg-paper py-1.5 shadow-2xl backdrop-blur-md max-h-80 overflow-y-auto"
        >
          <li className="px-3.5 py-1.5 border-b border-sand/40 text-[10px] font-bold uppercase tracking-wider text-stone/70">
            Languages ({enabled.length})
          </li>

          <div className="divide-y divide-sand/20">
            {enabled.map((l) => {
              const isSelected = l.code === current;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(l.code)}
                    className={cn(
                      "flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-paper-warm/80 cursor-pointer",
                      isSelected ? "bg-sand/30 font-bold text-ink" : "text-stone-800",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none" aria-hidden>
                        {l.flag}
                      </span>
                      <div>
                        <span className="block leading-tight font-medium text-ink">
                          {l.native}
                        </span>
                        <span className="text-[10px] text-stone leading-none">{l.label}</span>
                      </div>
                    </div>

                    {isSelected ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden
                        className="text-reef-deep shrink-0"
                      >
                        <path
                          d="M2 7.5l3.5 3.5L12 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </div>
        </ul>
      ) : null}
    </div>
  );
}
