"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./sections";
import { TourCard } from "./cards";
import type { CatalogueTour } from "@/lib/store/types";
import { useCatalogue } from "./SiteProvider";

/**
 * Homepage catalogue — mirrors the reference "Full List of Available Tours"
 * block: a category filter bar plus per-category sections (heading, caption and
 * count) rendered as a grid of tour cards. "All Tours" stacks every group.
 */
const GROUPS: { name: string; caption: string; categories: string[] }[] = [
  { name: "Sea & Diving", caption: "Discover the Red Sea", categories: ["sea-water"] },
  { name: "Safari", caption: "Breathe in the desert", categories: ["desert", "adventure"] },
  { name: "Historical", caption: "Where history began", categories: ["culture"] },
  {
    name: "Entertainment",
    caption: "Dive into the adventure",
    categories: ["wildlife", "leisure", "private-transfers"],
  },
];

function toursIn(categories: string[], catalogue: CatalogueTour[]) {
  return catalogue
    .filter((t) => categories.includes(t.category))
    .sort((a, b) => a.priority - b.priority);
}

export function HomeCatalogue() {
  const catalogue = useCatalogue();
  const [active, setActive] = useState("All Tours");
  const tabs = ["All Tours", ...GROUPS.map((g) => g.name)];
  const visible = active === "All Tours" ? GROUPS : GROUPS.filter((g) => g.name === active);

  return (
    <section id="tours" className="band scroll-mt-24">
      <div className="shell">
        <SectionHeading
          eyebrow="Our tours"
          title="Full list of available day trips & excursions"
        />

        {/* Filter bar */}
        <div className="mt-8 flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="chip shrink-0"
              data-active={active === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Groups */}
        <div className="mt-12 space-y-16">
          {visible.map((group) => {
            const list = toursIn(group.categories, catalogue);
            if (!list.length) return null;
            return (
              <div key={group.name}>
                <div className="flex items-end justify-between gap-4 pb-2">
                  <div>
                    <h3 className="font-display text-[1.75rem] leading-tight">{group.name}</h3>
                    <p className="mt-1 text-[0.9rem] text-stone">{group.caption}</p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-reef-deep/10 px-3 py-1 text-[0.8rem] font-semibold text-reef-deep">
                    {list.length} tours
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
        </div>
      </div>
    </section>
  );
}
