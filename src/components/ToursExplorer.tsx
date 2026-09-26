"use client";

import { useMemo, useState } from "react";
import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { durationBuckets } from "@/data/tours";
import type { Tour } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TourCard } from "./cards";

type SortKey = "recommended" | "price-asc" | "price-desc" | "duration" | "popular";

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "duration", label: "Duration: shortest" },
];

const tourTypes = [
  { id: "group", label: "Small group" },
  { id: "private", label: "Private" },
  { id: "transfer", label: "Transfer" },
] as const;

/**
 * Tour discovery. All filtering happens client-side over a static dataset,
 * which is the right trade-off at this catalogue size: instant feedback, no
 * request waterfall, no spinner. Swap `tours` for a server action or a search
 * index when the catalogue outgrows a couple of hundred records.
 */
export function ToursExplorer({
  tours,
  lockedDestination,
  lockedCategory,
}: {
  tours: Tour[];
  lockedDestination?: string;
  lockedCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState(lockedDestination ?? "all");
  const [category, setCategory] = useState(lockedCategory ?? "all");
  const [duration, setDuration] = useState("all");
  const [type, setType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(0); // 0 = no cap
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const priceCeiling = useMemo(() => {
    const prices = tours.map((t) => t.priceFrom).filter((p): p is number => p !== null);
    return prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 0;
  }, [tours]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = tours.filter((tour) => {
      if (destination !== "all" && tour.destination !== destination) return false;
      if (category !== "all" && tour.category !== category) return false;
      if (type !== "all" && tour.type !== type) return false;

      if (duration !== "all") {
        const bucket = durationBuckets.find((b) => b.id === duration);
        if (bucket && !bucket.test(tour.durationHours)) return false;
      }

      // A price cap should never hide "on request" tours — they have no price
      // to compare, and hiding them would silently drop the transfer catalogue.
      if (maxPrice > 0 && tour.priceFrom !== null && tour.priceFrom > maxPrice) {
        return false;
      }

      if (q) {
        const haystack = [
          tour.title,
          tour.summary,
          tour.category,
          tour.destination,
          ...tour.highlights,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort(
          (a, b) => (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER),
        );
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.priceFrom ?? -1) - (a.priceFrom ?? -1));
        break;
      case "duration":
        sorted.sort(
          (a, b) => (a.durationHours ?? Number.MAX_SAFE_INTEGER) - (b.durationHours ?? Number.MAX_SAFE_INTEGER),
        );
        break;
      case "popular":
        sorted.sort(
          (a, b) => Number(b.featured) - Number(a.featured) || a.priority - b.priority,
        );
        break;
      default:
        sorted.sort((a, b) => a.priority - b.priority);
    }
    return sorted;
  }, [tours, query, destination, category, duration, type, maxPrice, sort]);

  const activeCount =
    (destination !== "all" && !lockedDestination ? 1 : 0) +
    (category !== "all" && !lockedCategory ? 1 : 0) +
    (duration !== "all" ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (maxPrice > 0 ? 1 : 0);

  function reset() {
    setQuery("");
    setDestination(lockedDestination ?? "all");
    setCategory(lockedCategory ?? "all");
    setDuration("all");
    setType("all");
    setMaxPrice(0);
    setSort("recommended");
  }

  return (
    <div>
      {/* ───────── Search + sort bar ───────── */}
      <div className="sticky top-[68px] z-40 -mx-5 border-y border-sand bg-paper/95 px-5 py-3 backdrop-blur-md md:top-[76px] md:mx-0 md:px-0 md:py-4">
        <div className="flex items-center gap-3">
          <div className="relative grow">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone"
            >
              <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.4" />
              <path d="m13.5 13.5 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiences — reef, desert, dolphins, transfer…"
              aria-label="Search tours"
              className="field pl-11"
            />
          </div>

          <button
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="chip h-[3.25rem] shrink-0 px-4 lg:hidden"
            data-active={activeCount > 0}
          >
            Filters
            {activeCount > 0 ? (
              <span className="grid size-5 place-items-center rounded-pill bg-sun text-[0.625rem] font-semibold text-ink">
                {activeCount}
              </span>
            ) : null}
          </button>

          <label className="hidden shrink-0 items-center gap-2 lg:flex">
            <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort tours"
              className="field h-[3.25rem] w-[13rem]"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[17rem_1fr] lg:gap-14">
        {/* ───────── Filters ───────── */}
        <aside
          className={cn(
            "lg:block",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <div className="flex flex-col gap-8 lg:sticky lg:top-[10.5rem]">
            <div className="flex items-center justify-between">
              <h2 className="eyebrow text-stone">Refine</h2>
              {activeCount > 0 || query ? (
                <button
                  onClick={reset}
                  className="text-[0.6875rem] uppercase tracking-[0.14em] text-reef underline underline-offset-4"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            {!lockedDestination ? (
              <FilterGroup label="Destination">
                <ChipRow
                  value={destination}
                  onChange={setDestination}
                  options={[
                    { id: "all", label: "All" },
                    ...destinations.map((d) => ({ id: d.slug, label: d.name })),
                  ]}
                />
              </FilterGroup>
            ) : null}

            {!lockedCategory ? (
              <FilterGroup label="Experience type">
                <ChipRow
                  value={category}
                  onChange={setCategory}
                  options={[
                    { id: "all", label: "All" },
                    ...experiences.map((e) => ({ id: e.slug, label: e.name })),
                  ]}
                />
              </FilterGroup>
            ) : null}

            <FilterGroup label="Duration">
              <ChipRow
                value={duration}
                onChange={setDuration}
                options={[
                  { id: "all", label: "Any" },
                  ...durationBuckets.map((b) => ({ id: b.id, label: b.label })),
                ]}
              />
            </FilterGroup>

            <FilterGroup label="Tour type">
              <ChipRow
                value={type}
                onChange={setType}
                options={[
                  { id: "all", label: "Any" },
                  ...tourTypes.map((t) => ({ id: t.id, label: t.label })),
                ]}
              />
            </FilterGroup>

            {priceCeiling > 0 ? (
              <FilterGroup
                label={
                  maxPrice > 0 ? `Max price · $${maxPrice}` : "Max price · any"
                }
              >
                <input
                  type="range"
                  min={0}
                  max={priceCeiling}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="Maximum price per adult"
                  className="w-full accent-[var(--color-reef)]"
                />
                <p className="mt-2 text-[0.6875rem] text-stone">
                  Tours quoted on request are always shown.
                </p>
              </FilterGroup>
            ) : null}

            <label className="lg:hidden">
              <span className="label">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="field"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </aside>

        {/* ───────── Results ───────── */}
        <div>
          <p className="mb-6 text-[0.8125rem] text-stone" aria-live="polite">
            {results.length} {results.length === 1 ? "experience" : "experiences"}
            {query ? ` matching “${query}”` : ""}
          </p>

          {results.length ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((tour, i) => (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  priority={i < 3}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 30vw"
                />
              ))}
            </div>
          ) : (
            <div className="border border-sand px-6 py-16 text-center">
              <h3 className="headline text-[1.5rem]">Nothing matches that yet</h3>
              <p className="lede mx-auto mt-3 max-w-md text-[0.9375rem]">
                Try widening the filters — or tell us what you had in mind and
                we&apos;ll build it for you.
              </p>
              <button onClick={reset} className="btn btn-outline btn-sm mt-7">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-sand pt-5">
      <h3 className="label">{label}</h3>
      {children}
    </div>
  );
}

function ChipRow({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          data-active={value === o.id}
          className="chip"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
