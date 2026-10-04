/**
 * Client-safe label lookups with comprehensive multi-language support.
 *
 * `repo.ts` is server-only (it touches the file system), so client components
 * use these lightweight helpers, backed by the static seed vocabulary and
 * multi-language translation tables.
 */

import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";

const LOCALIZED_DESTINATIONS: Record<string, Record<string, string>> = {
  "sharm-el-sheikh": {
    en: "Sharm El Sheikh",
    ar: "شرم الشيخ",
    de: "Scharm El-Scheich",
    it: "Sharm el-Sheikh",
    pl: "Szarm el-Szejk",
    ru: "Шарм-эль-Шейх",
    uk: "Шарм-ель-Шейх",
    fr: "Charm el-Cheikh",
    ro: "Sharm El Sheikh",
    nl: "Sjarm-el-Sjeik",
  },
  cairo: {
    en: "Cairo",
    ar: "القاهرة",
    de: "Kairo",
    it: "Il Cairo",
    pl: "Kair",
    ru: "Каир",
    uk: "Каїр",
    fr: "Le Caire",
    ro: "Cairo",
    nl: "Caïro",
  },
};

const LOCALIZED_EXPERIENCES: Record<string, Record<string, string>> = {
  "sea-water": {
    en: "Sea & Diving",
    ar: "البحر والغوص",
    de: "Meer & Tauchen",
    it: "Mare & Immersioni",
    pl: "Morze i nurkowanie",
    ru: "Море и дайвинг",
    uk: "Море та дайвінг",
    fr: "Mer & Plongée",
    ro: "Mare & Scufundări",
    nl: "Zee & Duiken",
  },
  "sea-diving": {
    en: "Sea & Diving",
    ar: "البحر والغوص",
    de: "Meer & Tauchen",
    it: "Mare & Immersioni",
    pl: "Morze i nurkowanie",
    ru: "Море и дайвинг",
    uk: "Море та дайвінг",
    fr: "Mer & Plongée",
    ro: "Mare & Scufundări",
    nl: "Zee & Duiken",
  },
  desert: {
    en: "Safari",
    ar: "سفاري الصحراء",
    de: "Safari & Wüste",
    it: "Safari nel Deserto",
    pl: "Safari pustynne",
    ru: "Сафари в пустыне",
    uk: "Сафарі в пустелі",
    fr: "Safari désert",
    ro: "Safari în deșert",
    nl: "Woestijnsafari",
  },
  safari: {
    en: "Safari",
    ar: "سفاري الصحراء",
    de: "Safari & Wüste",
    it: "Safari nel Deserto",
    pl: "Safari pustynne",
    ru: "Сафари в пустыне",
    uk: "Сафарі в пустелі",
    fr: "Safari désert",
    ro: "Safari în deșert",
    nl: "Woestijnsafari",
  },
  culture: {
    en: "Historical",
    ar: "تاريخية وثقافية",
    de: "Historisch & Kultur",
    it: "Storico & Cultura",
    pl: "Wycieczki historyczne",
    ru: "История и культура",
    uk: "Історія та культура",
    fr: "Historique & Culture",
    ro: "Istoric & Cultură",
    nl: "Historisch & Cultuur",
  },
  historical: {
    en: "Historical",
    ar: "تاريخية وثقافية",
    de: "Historisch & Kultur",
    it: "Storico & Cultura",
    pl: "Wycieczki historyczne",
    ru: "История и культура",
    uk: "Історія та культура",
    fr: "Historique & Culture",
    ro: "Istoric & Cultură",
    nl: "Historisch & Cultuur",
  },
  adventure: {
    en: "Entertainment & Adventure",
    ar: "ترفيه ومغامرة",
    de: "Unterhaltung & Abenteuer",
    it: "Intrattenimento & Avventura",
    pl: "Rozrywka i przygoda",
    ru: "Развлечения и приключения",
    uk: "Розваги та пригоди",
    fr: "Divertissement & Aventure",
    ro: "Divertisment & Aventură",
    nl: "Vermaak & Avontuur",
  },
  entertainment: {
    en: "Entertainment",
    ar: "ترفيه ومغامرة",
    de: "Unterhaltung",
    it: "Intrattenimento",
    pl: "Rozrywka",
    ru: "Развлечения",
    uk: "Розваги",
    fr: "Divertissement",
    ro: "Divertisment",
    nl: "Vermaak",
  },
  wildlife: {
    en: "Wildlife & Dolphins",
    ar: "الحياة البحرية والدلافين",
    de: "Tierwelt & Delfine",
    it: "Fauna selvatica & Delfini",
    pl: "Dzika przyroda i delfiny",
    ru: "Морская фауна и дельфины",
    uk: "Морська фауна та дельфіни",
    fr: "Faune & Dauphins",
    ro: "Animale sălbatice & Delfini",
    nl: "Dieren & Dolfijnen",
  },
  leisure: {
    en: "Leisure & Shows",
    ar: "استجمام وعروض ترفيهية",
    de: "Freizeit & Shows",
    it: "Tempo libero & Spettacoli",
    pl: "Wypoczynek i pokazy",
    ru: "Отдых и шоу",
    uk: "Відпочинок та шоу",
    fr: "Détente & Spectacles",
    ro: "Timp liber & Spectacole",
    nl: "Ontspanning & Shows",
  },
  "private-transfers": {
    en: "Private Transfers",
    ar: "توصيل وانتقالات خاصة",
    de: "Private Transfers",
    it: "Transfer Privati",
    pl: "Prywatne transfery",
    ru: "Индивидуальные трансферы",
    uk: "Індивідуальні трансфери",
    fr: "Transferts privés",
    ro: "Transferuri private",
    nl: "Privétransfers",
  },
};

export function destinationName(slug?: string | null, lang?: string | null): string {
  if (!slug) return lang === "ar" ? "شرم الشيخ" : "Sharm El Sheikh";
  const code = (lang || "en").toLowerCase();
  const localized = LOCALIZED_DESTINATIONS[slug]?.[code];
  if (localized) return localized;
  return destinations.find((d) => d.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export function experienceName(slug?: string | null, lang?: string | null): string {
  if (!slug) return lang === "ar" ? "رحلات وجولات" : "Excursion";
  const code = (lang || "en").toLowerCase();
  const localized = LOCALIZED_EXPERIENCES[slug]?.[code];
  if (localized) return localized;
  return experiences.find((e) => e.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

/** Duration buckets used by the tours filter bar (mirrors data/tours). */
export const durationBuckets = [
  { id: "short", label: "Up to 2 hours", test: (h: number | null) => h !== null && h <= 2 },
  { id: "half", label: "Half day", test: (h: number | null) => h !== null && h > 2 && h <= 6 },
  { id: "full", label: "Full day", test: (h: number | null) => h !== null && h > 6 },
] as const;

export function durationBucketLabel(id: string, lang?: string | null): string {
  const isAr = lang === "ar";
  const isDe = lang === "de";
  const isIt = lang === "it";
  const isRu = lang === "ru";
  const isFr = lang === "fr";
  const isPl = lang === "pl";

  switch (id) {
    case "short":
      if (isAr) return "حتى ساعتين";
      if (isDe) return "Bis zu 2 Stunden";
      if (isIt) return "Fino a 2 ore";
      if (isRu) return "До 2 часов";
      if (isFr) return "Jusqu'à 2 heures";
      if (isPl) return "Do 2 godzin";
      return "Up to 2 hours";
    case "half":
      if (isAr) return "نصف يوم";
      if (isDe) return "Halbtags";
      if (isIt) return "Mezza giornata";
      if (isRu) return "Полдня";
      if (isFr) return "Demi-journée";
      if (isPl) return "Pół dnia";
      return "Half day";
    case "full":
      if (isAr) return "يوم كامل";
      if (isDe) return "Ganztags";
      if (isIt) return "Giornata intera";
      if (isRu) return "Полный день";
      if (isFr) return "Journée entière";
      if (isPl) return "Cały dzień";
      return "Full day";
    default:
      return id;
  }
}
