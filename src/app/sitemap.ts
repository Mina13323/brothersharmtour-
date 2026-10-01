import type { MetadataRoute } from "next";
import {
  activeDestinations,
  activeExperiences,
  publishedPackages,
  publishedTours,
} from "@/lib/store/repo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com";
  const url = (path: string) => `${base}${path}`;
  const destinations = activeDestinations();
  const experiences = activeExperiences();
  const tours = publishedTours();
  const packages = publishedPackages();

  /* Only canonical, indexable URLs belong here. /book is a transactional
     form marked noindex, so listing it would invite crawl waste. */
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/tours"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/destinations"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/experiences"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...destinations.map((d) => ({
      url: url(`/destinations/${d.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...experiences.map((e) => ({
      url: url(`/experiences/${e.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tours.map((t) => ({
      url: url(`/tours/${t.slug}`),
      lastModified: new Date(t.updatedAt),
      changeFrequency: "monthly" as const,
      priority: t.featured ? 0.8 : 0.6,
    })),
    ...packages.map((p) => ({
      url: url(`/packages/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
