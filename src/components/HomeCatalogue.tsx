"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./sections";
import { TourCard } from "./cards";
import { tours } from "@/data/tours";
import type { Tour } from "@/lib/types";

/**
 * Homepage catalogue — mirrors the reference "Full List of Available Tours"
 * block: a category filter bar plus per-category sections (heading, caption and
 * count) rendered as a grid of tour cards. "All Tours" stacks every group.
 */
const GROUPS: { name: string; caption: string; categories: Tour["category"][] }[] = [
  { name: "Sea & Diving", caption: "Discover the Red Sea", categories: ["sea-water"] },
  { name: "Safari", caption: "Breathe in the desert", categories: ["desert", "adventure"] },
  { name: "Historical", caption: "Where history began", categories: ["culture"] },
  {
    name: "Entertainment",
    caption: "Dive into the adventure",
    categories: ["wildlife", "leisure", "private-transfers"],
  },
];

function toursIn(categories: Tour["category"][]) {
  return tours
    .filter((t) => categories.includes(t.category))
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

export function HomeCatalogue() {
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
        <div className="mt-8 flex flex-wrap gap-2.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="chip"
              data-active={active === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Groups */}
        <div className="mt-12 space-y-16">
          {visible.map((group) => {
            const list = toursIn(group.categories);
            if (!list.length) return null;
            return (
              <div key={group.name}>
                <div className="flex items-end justify-between gap-4 border-b border-sand pb-4">
                  <div>
                    <h3 className="font-display text-[1.75rem] leading-tight">{group.name}</h3>
                    <p className="mt-1 text-[0.9rem] text-stone">{group.caption}</p>
                  </div>
                  <span className="shrink-0 text-[0.85rem] font-medium text-reef-deep">
                    {list.length} tours
                  </span>
                </div>

                <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((tour, i) => (
                    <Reveal key={tour.slug} delay={(i % 4) * 70}>
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
