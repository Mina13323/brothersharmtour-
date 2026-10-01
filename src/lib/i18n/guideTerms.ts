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

const SEARCH_ADJECTIVES = [
  "English",
  "German",
  "Deutsch",
  "Italian",
  "Italiano",
  "Polish",
  "Polski",
  "Russian",
  "Русский",
  "Ukrainian",
  "Українська",
  "French",
  "Français",
  "Arabic",
  "العربية",
  "Romanian",
  "Română",
  "Dutch",
  "Nederlands",
];

const ADJ_PATTERN = SEARCH_ADJECTIVES.join("|");

/**
 * Localizes any guide-related text string (e.g. "English-speaking guide",
 * "English-speaking Brother Sharm Tour guide", "English-speaking drivers", "English guides", "in English")
 * into the target language adjective (e.g. "German-speaking guide", "German-speaking drivers").
 */
export function localizeGuideText(val: string, langCode: string): string {
  if (!val) return val;
  const target = getGuideTerms(langCode);

  let res = val;
  // Replace "{Language}-speaking" -> "{Target}-speaking" (handles "English-speaking guide", "English-speaking Brother Sharm Tour guide", "English-speaking drivers", etc.)
  res = res.replace(new RegExp(`\\b(${ADJ_PATTERN})-speaking\\b`, "gi"), `${target.adjective}-speaking`);
  // Replace "{Language} guides" -> "{Target} guides"
  res = res.replace(new RegExp(`\\b(${ADJ_PATTERN}) guides\\b`, "gi"), `${target.adjective} guides`);
  // Replace "{Language} guide" -> "{Target} guide"
  res = res.replace(new RegExp(`\\b(${ADJ_PATTERN}) guide\\b`, "gi"), `${target.adjective} guide`);
  // Replace "in {Language}" -> "in {Target}"
  res = res.replace(new RegExp(`\\bin (${ADJ_PATTERN})\\b`, "gi"), `in ${target.adjective}`);
  // Replace "{Language} on all our trips" -> "{Target} on all our trips"
  res = res.replace(new RegExp(`\\b(${ADJ_PATTERN}) on all our trips\\b`, "gi"), `${target.adjective} on all our trips`);

  return res;
}

/**
 * Replaces any existing guide language text in the DOM with the newly selected language.
 * Handles both plain English and previously swapped language adjectives.
 */
export function updateDomGuideTerms(langCode: string) {
  if (typeof window === "undefined" || !document.body) return;

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

    const newVal = localizeGuideText(node.nodeValue, langCode);
    if (newVal !== node.nodeValue) {
      node.nodeValue = newVal;
    }
  }
}

