"use client";

import { useMemo, useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./sections";
import { TourCard } from "./cards";
import type { CatalogueTour } from "@/lib/store/types";
import { useCatalogue, useTranslation } from "./SiteProvider";
import type { TranslationDictionary } from "@/lib/i18n/translations";

/**
 * Homepage catalogue — "Our Tours" section:
 * Structured tabs:
 * - All Tours
 * - Sea & Diving
 * - Safari
 * - Historical
 * - Entertainment
 *
 * Dynamically driven from CMS published tours with full i18n support.
 */
interface CategoryGroup {
  id: string;
  nameKey: keyof TranslationDictionary;
  captionKey: keyof TranslationDictionary;
  defaultName: string;
  defaultCaption: string;
  categories: string[];
}

const GROUPS: CategoryGroup[] = [
  {
    id: "sea-diving",
    nameKey: "cat_sea_diving",
    captionKey: "caption_sea",
    defaultName: "Sea & Diving",
    defaultCaption: "Discover the Red Sea",
    categories: ["sea-water", "sea-diving", "sea", "diving"],
  },
  {
    id: "safari",
    nameKey: "cat_safari",
    captionKey: "caption_safari",
    defaultName: "Safari",
    defaultCaption: "Breathe in the desert",
    categories: ["desert", "adventure", "safari"],
  },
  {
    id: "historical",
    nameKey: "cat_historical",
    captionKey: "caption_historical",
    defaultName: "Historical",
    defaultCaption: "Where history began",
    categories: ["culture", "historical", "history"],
  },
  {
    id: "entertainment",
    nameKey: "cat_entertainment",
    captionKey: "caption_entertainment",
    defaultName: "Entertainment",
    defaultCaption: "Dive into the adventure",
    categories: ["wildlife", "leisure", "private-transfers", "entertainment"],
  },
];

function matchTours(categories: string[], catalogue: CatalogueTour[]) {
  return catalogue
    .filter((t) => {
      const cat = (t.category || "").toLowerCase();
      return categories.some((c) => cat === c.toLowerCase() || cat.includes(c.toLowerCase()));
    })
    .sort((a, b) => a.priority - b.priority);
}

export function HomeCatalogue() {
  const catalogue = useCatalogue();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabs = [
    { id: "all", label: t("cat_all", "All Tours") },
    { id: "sea-diving", label: t("cat_sea_diving", "Sea & Diving") },
    { id: "safari", label: t("cat_safari", "Safari") },
    { id: "historical", label: t("cat_historical", "Historical") },
    { id: "entertainment", label: t("cat_entertainment", "Entertainment") },
  ];

  const visibleGroups = useMemo(() => {
    if (activeTab === "all") return GROUPS;
    return GROUPS.filter((g) => g.id === activeTab);
  }, [activeTab]);

  // Catch any tours whose category might not match the 4 standard groups, so they are never lost
  const unassignedTours = useMemo(() => {
    if (activeTab !== "all") return [];
    const allKnown = GROUPS.flatMap((g) => g.categories);
    return catalogue.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      return !allKnown.some((c) => cat === c.toLowerCase() || cat.includes(c.toLowerCase()));
    });
  }, [activeTab, catalogue]);

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
              data-active={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Groups */}
        <div className="mt-12 space-y-16">
          {visibleGroups.map((group) => {
            const list = matchTours(group.categories, catalogue);
            if (!list.length) return null;
            const groupTitle = t(group.nameKey, group.defaultName);
            const groupCaption = t(group.captionKey, group.defaultCaption);
            const toursWord = t("tours_count", "tours");

            return (
              <div key={group.id}>
                <div className="flex items-end justify-between gap-4 pb-2">
                  <div>
                    <h3 className="font-display text-[1.75rem] leading-tight text-ink">
                      {groupTitle}
                    </h3>
                    <p className="mt-1 text-[0.9rem] text-stone">{groupCaption}</p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-reef-deep/10 px-3 py-1 text-[0.8rem] font-semibold text-reef-deep">
                    {list.length} {toursWord}
                  </span>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((tour, i) => (
                    <Reveal key={tour.slug} variant="card" delay={(i % 4) * 70}>
                      <TourCard tour={tour} />
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Fallback for any newly created custom categories in CMS */}
          {unassignedTours.length > 0 && (
            <div>
              <div className="flex items-end justify-between gap-4 pb-2">
                <div>
                  <h3 className="font-display text-[1.75rem] leading-tight text-ink">
                    {t("nav_experiences", "Experiences")}
                  </h3>
                  <p className="mt-1 text-[0.9rem] text-stone">
                    {t("our_tours_eyebrow", "Our tours")}
                  </p>
                </div>
                <span className="shrink-0 rounded-pill bg-reef-deep/10 px-3 py-1 text-[0.8rem] font-semibold text-reef-deep">
                  {unassignedTours.length} {t("tours_count", "tours")}
                </span>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {unassignedTours.map((tour, i) => (
                  <Reveal key={tour.slug} variant="card" delay={(i % 4) * 70}>
                    <TourCard tour={tour} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
