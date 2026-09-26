import type { Metadata } from "next";

import { site } from "@/data/site";
import type { MediaImage, SeoMeta } from "./types";

/**
 * BRO TOUR — metadata builder
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
   * Emit the title verbatim, bypassing the layout's `%s · Bro Tour` template.
   * The template only decorates child segments, so the root page would
   * otherwise ship a title with no brand in it at all.
   */
  absoluteTitle?: boolean;
}): Metadata {
  const title = seo?.title ?? fallbackTitle;
  const description = seo?.description ?? fallbackDescription;
  const ogImage = seo?.ogImage ?? image;
  const url = `${site.url}${path}`;

  return {
    title: absoluteTitle ? { absolute: `${title} | ${site.name}` } : title,
    description,
    alternates: { canonical: path },
    ...(noindex
      ? // Thin or transactional routes stay out of the index, but are still
        // followed so they pass link equity to the pages that should rank.
        { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      type: "website",
      siteName: site.name,
      // Titles carry the brand explicitly here: a social card is seen out of
      // context, where the layout's title template does not apply.
      title: `${title} | ${site.name}`,
      description,
      url,
      ...(ogImage
        ? { images: [{ url: ogImage.src, width: 1200, height: 630, alt: ogImage.alt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      ...(ogImage ? { images: [ogImage.src] } : {}),
    },
  };
}
