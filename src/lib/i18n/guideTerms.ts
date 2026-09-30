/**
 * Dynamic language adjective and guide term mappings for all 10 supported languages.
 * When the visitor changes language (e.g. to German), references to
 * "English-speaking guide", "English guides", "in English" dynamically adapt
 * to "German-speaking guide", "German guides", "in German", etc.
 */

export interface GuideLanguageConfig {
  code: string;
  adjective: string;
  nativeAdjective: string;
  speakingGuide: string;
  speakingGuides: string;
  drivers: string;
  inLanguage: string;
}

export const GUIDE_LANGUAGE_MAP: Record<string, GuideLanguageConfig> = {
  en: {
    code: "en",
    adjective: "English",
    nativeAdjective: "English",
    speakingGuide: "English-speaking guide",
    speakingGuides: "English-speaking guides",
    drivers: "English-speaking drivers",
    inLanguage: "in English",
  },
  de: {
    code: "de",
    adjective: "German",
    nativeAdjective: "Deutsch",
    speakingGuide: "German-speaking guide",
    speakingGuides: "German-speaking guides",
    drivers: "German-speaking drivers",
    inLanguage: "in German",
  },
  it: {
    code: "it",
    adjective: "Italian",
    nativeAdjective: "Italiano",
    speakingGuide: "Italian-speaking guide",
    speakingGuides: "Italian-speaking guides",
    drivers: "Italian-speaking drivers",
    inLanguage: "in Italian",
  },
  pl: {
    code: "pl",
    adjective: "Polish",
    nativeAdjective: "Polski",
    speakingGuide: "Polish-speaking guide",
    speakingGuides: "Polish-speaking guides",
    drivers: "Polish-speaking drivers",
    inLanguage: "in Polish",
  },
  ru: {
    code: "ru",
    adjective: "Russian",
    nativeAdjective: "Русский",
    speakingGuide: "Russian-speaking guide",
    speakingGuides: "Russian-speaking guides",
    drivers: "Russian-speaking drivers",
    inLanguage: "in Russian",
  },
  uk: {
    code: "uk",
    adjective: "Ukrainian",
    nativeAdjective: "Українська",
    speakingGuide: "Ukrainian-speaking guide",
    speakingGuides: "Ukrainian-speaking guides",
    drivers: "Ukrainian-speaking drivers",
    inLanguage: "in Ukrainian",
  },
  fr: {
    code: "fr",
    adjective: "French",
    nativeAdjective: "Français",
    speakingGuide: "French-speaking guide",
    speakingGuides: "French-speaking guides",
    drivers: "French-speaking drivers",
    inLanguage: "in French",
  },
  ar: {
    code: "ar",
    adjective: "Arabic",
    nativeAdjective: "العربية",
    speakingGuide: "Arabic-speaking guide",
    speakingGuides: "Arabic-speaking guides",
    drivers: "Arabic-speaking drivers",
    inLanguage: "in Arabic",
  },
  ro: {
    code: "ro",
    adjective: "Romanian",
    nativeAdjective: "Română",
    speakingGuide: "Romanian-speaking guide",
    speakingGuides: "Romanian-speaking guides",
    drivers: "Romanian-speaking drivers",
    inLanguage: "in Romanian",
  },
  nl: {
    code: "nl",
    adjective: "Dutch",
    nativeAdjective: "Nederlands",
    speakingGuide: "Dutch-speaking guide",
    speakingGuides: "Dutch-speaking guides",
    drivers: "Dutch-speaking drivers",
    inLanguage: "in Dutch",
  },
};

export function getGuideTerms(langCode: string): GuideLanguageConfig {
  return GUIDE_LANGUAGE_MAP[langCode] || GUIDE_LANGUAGE_MAP.en;
}

/**
 * Replaces any existing guide language text in the DOM with the newly selected language.
 * Handles both plain English and previously swapped language adjectives.
 */
export function updateDomGuideTerms(langCode: string) {
  if (typeof window === "undefined" || !document.body) return;

  const target = getGuideTerms(langCode);
  const allAdjectives = Object.values(GUIDE_LANGUAGE_MAP).map((c) => c.adjective);
  const regexPattern = new RegExp(
    `(${allAdjectives.join("|")})(-speaking guides?|-speaking Brother Sharm Tour guide|-speaking drivers?| guides?| on WhatsApp, in [A-Za-z]+)`,
    "gi"
  );

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue) continue;
    const parent = node.parentElement;
    if (
      parent &&
      (parent.tagName === "SCRIPT" ||
        parent.tagName === "STYLE" ||
        parent.closest("#admin") ||
        parent.closest("[role='listbox']"))
    ) {
      continue;
    }

    let val = node.nodeValue;
    let modified = false;

    // Replace "{Adjective}-speaking guide(s)" -> "{TargetAdjective}-speaking guide(s)"
    if (regexPattern.test(val)) {
      val = val.replace(
        new RegExp(`(${allAdjectives.join("|")})-speaking guide`, "gi"),
        `${target.adjective}-speaking guide`
      );
      val = val.replace(
        new RegExp(`(${allAdjectives.join("|")})-speaking drivers`, "gi"),
        `${target.adjective}-speaking drivers`
      );
      val = val.replace(
        new RegExp(`(${allAdjectives.join("|")}) guides`, "gi"),
        `${target.adjective} guides`
      );
      val = val.replace(
        new RegExp(`in (${allAdjectives.join("|")})`, "gi"),
        `in ${target.adjective}`
      );
      modified = true;
    }

    if (modified) {
      node.nodeValue = val;
    }
  }
}
