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

interface SiteContextValue {
  settings: PublicSettings;
  catalogue: CatalogueTour[];
  currency: CurrencyContext;
  /** Formats a base-currency amount in the visitor's display currency. */
  money: (value: number | null | undefined, overrides?: Record<string, number>) => string | null;
  whatsappLink: (message?: string) => string;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

/** Catalogue lookup hook for the booking widget & search. */
export function useCatalogue() {
  return useSite().catalogue;
}

export function SiteProvider({
  settings,
  catalogue,
  currency,
  children,
}: {
  settings: PublicSettings;
  catalogue: CatalogueTour[];
  currency: CurrencyContext;
  children: ReactNode;
}) {
  const money = useCallback(
    (value: number | null | undefined, overrides?: Record<string, number>) =>
      moneyIn(value, currency, { overrides }),
    [currency],
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

  return (
    <SiteContext.Provider
      value={{ settings, catalogue, currency, money, whatsappLink }}
    >
      {children}
    </SiteContext.Provider>
  );
}
