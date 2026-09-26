import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { tours } from "@/data/tours";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${site.url}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: url("/tours"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: url("/destinations"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/experiences"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: url("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: url("/book"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
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
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: t.featured ? 0.8 : 0.6,
    })),
  ];
}
