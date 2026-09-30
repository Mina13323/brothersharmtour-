"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { updateDomGuideTerms } from "@/lib/i18n/guideTerms";

export interface Language {
  code: string;
  label: string;
  native: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

export const languages: Language[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "pl", label: "Polish", native: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "it", label: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "ru", label: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "uk", label: "Ukrainian", native: "Українська", flag: "🇺🇦", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇪🇬", dir: "rtl" },
  { code: "ro", label: "Romanian", native: "Română", flag: "🇷🇴", dir: "ltr" },
  { code: "nl", label: "Dutch", native: "Nederlands", flag: "🇳🇱", dir: "ltr" },
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function LanguageSwitcher({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Restore saved language
    const saved = localStorage.getItem("bst-lang");
    if (saved && languages.some((l) => l.code === saved)) {
      setCurrent(saved);
      const langConfig = languages.find((l) => l.code === saved);
      if (langConfig?.dir) {
        document.documentElement.dir = langConfig.dir;
      }
      setTimeout(() => updateDomGuideTerms(saved), 100);
    }

    // 2. Initialize Google Translate Script
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "pl,it,ru,en,de,uk,fr,ar,ro,nl",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (lang: Language) => {
    setCurrent(lang.code);
    localStorage.setItem("bst-lang", lang.code);
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir || "ltr";
    updateDomGuideTerms(lang.code);
    window.dispatchEvent(
      new CustomEvent("bst-lang-change", { detail: lang.code })
    );
    setOpen(false);

    // Apply translation cookie
    if (lang.code === "en") {
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie =
        "googtrans=; path=/; domain=" +
        window.location.hostname +
        "; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "googtrans=/en/en; path=/;";
    } else {
      document.cookie = `googtrans=/en/${lang.code}; path=/;`;
      document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname};`;
    }

    // Trigger Google Translate dropdown or reload to apply smoothly
    const selectElem = document.querySelector<HTMLSelectElement>(
      ".goog-te-combo"
    );
    if (selectElem) {
      selectElem.value = lang.code;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  const active = languages.find((l) => l.code === current) ?? languages[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Hidden mount point for Google Translate engine */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[0.8rem] font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer",
          tone === "light"
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-sand/60 bg-paper hover:bg-paper-warm text-ink"
        )}
      >
        <span className="text-sm leading-none">{active.flag}</span>
        <span className="uppercase font-semibold tracking-wider text-[11px]">
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

      {/* Dropdown Menu */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-[120] mt-2 w-52 overflow-hidden rounded-2xl border border-sand/70 bg-paper py-1.5 shadow-2xl backdrop-blur-md max-h-80 overflow-y-auto"
        >
          <div className="px-3 py-1.5 border-b border-sand/40 text-[10px] font-bold uppercase tracking-wider text-stone/70">
            Select Language ({languages.length})
          </div>

          <div className="divide-y divide-sand/20">
            {languages.map((lang) => {
              const isSelected = lang.code === current;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(lang)}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-paper-warm/80 cursor-pointer",
                    isSelected ? "bg-sand/30 font-bold text-ink" : "text-stone-800"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <span className="block leading-tight font-medium text-ink">
                        {lang.native}
                      </span>
                      <span className="text-[10px] text-stone leading-none">
                        {lang.label}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
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
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
