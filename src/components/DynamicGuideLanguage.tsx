"use client";

import { useEffect, useState } from "react";
import { getGuideTerms, type GuideLanguageConfig } from "@/lib/i18n/guideTerms";

export function useGuideLanguage(): GuideLanguageConfig {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const storedCookie = typeof document !== "undefined"
      ? document.cookie.split("; ").find((c) => c.startsWith("bt_lang="))?.split("=")[1]
      : null;
    const saved = localStorage.getItem("bst-lang") || storedCookie || "en";
    setLang(saved);

    const onLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setLang(customEvent.detail);
      }
    };

    window.addEventListener("bst-lang-change", onLangChange);
    return () => window.removeEventListener("bst-lang-change", onLangChange);
  }, []);

  return getGuideTerms(lang);
}

export function GuideLanguageBadge({
  format = "speaking-guides",
}: {
  format?: "speaking-guides" | "speaking-guide" | "adjective" | "drivers" | "in-language";
}) {
  const terms = useGuideLanguage();

  switch (format) {
    case "speaking-guide":
      return <span>{terms.speakingGuide}</span>;
    case "adjective":
      return <span>{terms.adjective}</span>;
    case "drivers":
      return <span>{terms.drivers}</span>;
    case "in-language":
      return <span>{terms.inLanguage}</span>;
    case "speaking-guides":
    default:
      return <span>{terms.speakingGuides}</span>;
  }
}
