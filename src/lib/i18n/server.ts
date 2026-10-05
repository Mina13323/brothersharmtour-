import { getVisitorLanguage } from "@/lib/siteview";
import { getTranslation, type TranslationKey } from "./translations";

/**
 * Server-side counterpart of `useSite().t` — same dictionary, same fallback
 * behaviour, no second translation system.
 *
 *   const tr = await getServerT();
 *   <h1>{tr("faq_title", "Good to know")}</h1>
 *
 * Pass an already-resolved language (e.g. from `getSiteView()`) to `forLanguage`
 * when the page has one, so the cookie is not read twice.
 */
export type ServerTranslate = (key: TranslationKey, fallback: string) => string;

export function translatorFor(lang: string): ServerTranslate {
  return (key, fallback) => getTranslation(lang, key) || fallback;
}

export async function getServerT(): Promise<ServerTranslate> {
  return translatorFor(await getVisitorLanguage());
}
