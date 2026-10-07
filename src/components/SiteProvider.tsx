"use client";

/**
 * Site-wide client context.
 *
 * The server layout loads the CMS once per request (settings + catalogue +
 * currency context) and hands it to this provider. Client components read the
 * live CMS values through hooks instead of importing static files, so an admin
 * edit reaches every corner of the site — nav, footer, booking widget, search,
 * prices, social links — without a rebuild.
 */

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import type { CatalogueTour } from "@/lib/store/types";
import type { CurrencyContext } from "@/lib/currency";
import { moneyIn } from "@/lib/currency";
import { setExperienceRegistry } from "@/lib/store/labels";
import type { PublicExperience } from "@/lib/siteview";

export interface PublicSettings {
  name: string;
  tagline: string;
  description: string;
  contact: {
    whatsapp: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    telegram?: string;
    tripadvisor?: string;
  };
  announcement: { enabled: boolean; text: string };
  trust: { yearsOperating?: string; guestsServed?: string };
  languages: { code: string; label: string; dir: string; enabled: boolean }[];
}

import type { TranslationDictionary } from "@/lib/i18n/translations";
import { getTranslation } from "@/lib/i18n/translations";

interface SiteContextValue {
  settings: PublicSettings;
  catalogue: CatalogueTour[];
  /** Published admin-managed categories, in display order. */
  experiences: PublicExperience[];
  currency: CurrencyContext;
  lang: string;
  /**
   * Formats a stored amount in the visitor's display currency.
   * `overrides` pins exact per-currency prices (adult base price only);
   * `from` is the currency the amount is stored in (tour/pkg `currency`).
   */
  money: (
    value: number | null | undefined,
    overrides?: Record<string, number>,
    from?: string,
  ) => string | null;
  whatsappLink: (message?: string) => string;
  t: (key: keyof TranslationDictionary | (string & {}), fallback?: string) => string;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

/** Translation lookup hook */
export function useTranslation() {
  const { lang, t } = useSite();
  return { lang, t };
}

/** Catalogue lookup hook for the booking widget & search. */
export function useCatalogue() {
  return useSite().catalogue;
}

export function SiteProvider({
  settings,
  catalogue,
  experiences = [],
  currency,
  lang = "en",
  children,
}: {
  settings: PublicSettings;
  catalogue: CatalogueTour[];
  experiences?: PublicExperience[];
  currency: CurrencyContext;
  lang?: string;
  children: ReactNode;
}) {
  // Labels follow the admin-managed category names (also during SSR).
  setExperienceRegistry(experiences);
  const money = useCallback(
    (value: number | null | undefined, overrides?: Record<string, number>, from?: string) =>
      moneyIn(value, currency, { overrides, from, lang }),
    [currency, lang],
  );

  const whatsappLink = useCallback(
    (message?: string) => {
      const text = encodeURIComponent(
        message ?? `Hi ${settings.name} — I'd like to plan a trip in Egypt.`,
      );
      return `https://wa.me/${settings.contact.whatsapp}?text=${text}`;
    },
    [settings.name, settings.contact.whatsapp],
  );

  const t = useCallback(
    (key: keyof TranslationDictionary | (string & {}), fallback?: string) => {
      const val = getTranslation(lang, key as keyof TranslationDictionary);
      if ((!val || val === key) && fallback) return fallback;
      return val || fallback || key;
    },
    [lang],
  );

  return (
    <SiteContext.Provider
      value={{ settings, catalogue, experiences, currency, lang, money, whatsappLink, t }}
    >
      {children}
    </SiteContext.Provider>
  );
}
