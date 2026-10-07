"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./sections";
import { TourCard } from "./cards";
import type { CatalogueTour } from "@/lib/store/types";
import { useCatalogue, useSite } from "./SiteProvider";
import { experienceName } from "@/lib/store/labels";

/**
 * Homepage catalogue — "Our Tours" section.
 *
 * The tabs are the published categories from Admin → Experience Categories —
 * the same list the Experiences pages, the tours filter and the tour editor
 * use — plus "All Tours" and "Packages". Each tour sits under the category it
 * is assigned to in the tour editor. Tours filed under a category that is not
 * published are kept in an "Other" group so they are never lost.
 */

function inCategory(tour: CatalogueTour, slug: string) {
  return tour.category === slug || (tour.categories ?? []).includes(slug);
}

export function HomeCatalogue() {
  const catalogue = useCatalogue();
  const { t, lang, experiences } = useSite();
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#packages") setActiveTab("packages");
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const regularPackages = useMemo(
    () => catalogue.filter((c) => c.isPackage || c.type === "package"),
    [catalogue],
  );

  const tours = useMemo(
    () =>
      catalogue
        .filter((c) => !c.isPackage && c.type !== "package")
        .sort((a, b) => a.priority - b.priority),
    [catalogue],
  );

  /** One group per published category that actually has tours. */
  const groups = useMemo(
    () =>
      experiences
        .map((e) => ({
          id: e.slug,
          title: experienceName(e.slug, lang),
          caption: e.tagline,
          list: tours.filter((c) => inCategory(c, e.slug)),
        }))
        .filter((g) => g.list.length > 0),
    [experiences, tours, lang],
  );

  /** Tours whose category is not a published one (draft / deleted category). */
  const otherTours = useMemo(
    () => tours.filter((c) => !experiences.some((e) => inCategory(c, e.slug))),
    [tours, experiences],
  );

  const allGroups = useMemo(
    () =>
      otherTours.length
        ? [
            ...groups,
            {
              id: "other",
              title: t("nav_experiences", "Experiences"),
              caption: t("our_tours_eyebrow", "Our tours"),
              list: otherTours,
            },
          ]
        : groups,
    [groups, otherTours, t],
  );

  const tabs = [
    { id: "all", label: t("cat_all", "All Tours") },
    ...allGroups.map((g) => ({ id: g.id, label: g.title })),
    { id: "packages", label: t("nav_packages", "Packages") },
  ];

  // If the active category disappears (renamed, unpublished), fall back to All.
  const tabExists = tabs.some((tab) => tab.id === activeTab);
  const currentTab = tabExists ? activeTab : "all";

  const visibleGroups =
    currentTab === "packages"
      ? []
      : currentTab === "all"
        ? allGroups
        : allGroups.filter((g) => g.id === currentTab);

  const showPackages =
    currentTab === "packages" || (currentTab === "all" && regularPackages.length > 0);

  const totalVisible =
    currentTab === "packages"
      ? regularPackages.length
      : visibleGroups.reduce((n, g) => n + g.list.length, 0) +
        (currentTab === "all" ? regularPackages.length : 0);

  return (
    <section id="tours" className="band scroll-mt-24">
      <div className="shell">
        <SectionHeading
          eyebrow={t("our_tours_eyebrow", "Our tours")}
          title={t("our_tours_title", "Full list of available day trips & excursions")}
        />

        {/* Filter bar */}
        <div className="mt-8 flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="chip shrink-0 cursor-pointer"
              data-active={currentTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-16">
          {showPackages && (
            <div className="order-last">
              <div className="flex items-end justify-between gap-4 pb-2">
                <div>
                  <h3 className="font-display text-[1.75rem] leading-tight text-ink">
                    {t("nav_packages", "Packages")}
                  </h3>
                  <p className="mt-1 text-[0.9rem] text-stone">
                    {t("catalogue_packages_caption", "Curated regular packages & bundled day excursions")}
                  </p>
                </div>
                <span className="shrink-0 rounded-pill bg-reef-deep/10 px-3 py-1 text-[0.8rem] font-semibold text-reef-deep">
                  {regularPackages.length} {t("nav_packages", "Packages").toLowerCase()}
                </span>
              </div>

              {regularPackages.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-sand/80 bg-paper-warm/50 p-12 text-center">
                  <p className="font-display text-xl text-ink">
                    {t("no_tours_found_in_category", "No packages currently available.")}
                  </p>
                </div>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {regularPackages.map((pkg, i) => (
                    <Reveal key={pkg.slug} variant="card" delay={(i % 4) * 70}>
                      <TourCard tour={pkg} />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          )}

          {totalVisible === 0 && currentTab !== "packages" && (
            <div className="rounded-3xl border border-sand/80 bg-paper-warm/50 p-12 text-center">
              <p className="font-display text-xl text-ink">
                {t("no_tours_found_in_category", "No tours currently available in this category.")}
              </p>
            </div>
          )}

          {visibleGroups.map((group) => (
            <div key={group.id}>
              <div className="flex items-end justify-between gap-4 pb-2">
                <div>
                  <h3 className="font-display text-[1.75rem] leading-tight text-ink">
                    {group.title}
                  </h3>
                  {group.caption ? (
                    <p className="mt-1 text-[0.9rem] text-stone">{group.caption}</p>
                  ) : null}
                </div>
                <span className="shrink-0 rounded-pill bg-reef-deep/10 px-3 py-1 text-[0.8rem] font-semibold text-reef-deep">
                  {group.list.length} {t("tours_count", "tours")}
                </span>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.list.map((tour, i) => (
                  <Reveal key={tour.slug} variant="card" delay={(i % 4) * 70}>
                    <TourCard tour={tour} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
