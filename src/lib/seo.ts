import type { Metadata } from "next";

import { site } from "@/data/site";
import { getSettings } from "@/lib/store/repo";
import type { MediaImage, SeoMeta } from "./types";

/**
 * CMS values when the store is reachable, static seed values otherwise (e.g.
 * during `next build` module evaluation before the store exists). Brand-level
 * SEO values (name, url) live in ONE place — the settings store.
 */
function brand(): { name: string; url: string } {
  try {
    return { name: getSettings().site.name, url: getSettings().site.url };
  } catch {
    return { name: site.name, url: site.url };
  }
}

/**
 * BROTHER SHARM TOUR — metadata builder
 *
 * One place that assembles title, description, canonical, OpenGraph and
 * Twitter metadata so every indexable route is consistent and none of them
 * silently inherit the site-wide OpenGraph card.
 *
 * Authored `SeoMeta` on a content record always wins; the derived arguments
 * are the fallback for records that have not been given one yet.
 */
export function buildMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  path,
  image,
  noindex = false,
  absoluteTitle = false,
}: {
  seo?: SeoMeta;
  fallbackTitle: string;
  fallbackDescription: string;
  /** Route path beginning with a slash — becomes the canonical URL. */
  path: string;
  image?: MediaImage;
  noindex?: boolean;
  /**
   * Emit the title verbatim, bypassing the layout's `%s · Brother Sharm Tour` template.
   * The template only decorates child segments, so the root page would
   * otherwise ship a title with no brand in it at all.
   */
  absoluteTitle?: boolean;
}): Metadata {
  const { name: brandName, url: baseUrl } = brand();
  const title = seo?.title ?? fallbackTitle;
  const description = seo?.description ?? fallbackDescription;
  const ogImage = seo?.ogImage ?? image;
  const url = `${baseUrl}${path}`;

  return {
    title: absoluteTitle ? { absolute: `${title} | ${brandName}` } : title,
    description,
    alternates: { canonical: path },
    ...(noindex
      ? // Thin or transactional routes stay out of the index, but are still
        // followed so they pass link equity to the pages that should rank.
        { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      type: "website",
      siteName: brandName,
      // Titles carry the brand explicitly here: a social card is seen out of
      // context, where the layout's title template does not apply.
      title: `${title} | ${brandName}`,
      description,
      url,
      ...(ogImage
        ? { images: [{ url: ogImage.src, width: 1200, height: 630, alt: ogImage.alt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${brandName}`,
      description,
      ...(ogImage ? { images: [ogImage.src] } : {}),
    },
  };
}
