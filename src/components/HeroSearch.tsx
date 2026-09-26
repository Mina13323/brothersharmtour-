"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { durationBuckets } from "@/data/tours";
import { cn } from "@/lib/utils";

/**
 * BRO TOUR — hero search
 *
 * A tabbed search panel that sits over the hero and hands off to /tours with
 * the filters pre-applied.
 *
 * Every control here maps to a filter the tours page actually implements.
 * A guests stepper was deliberately left out: nothing downstream consumes a
 * headcount, so it would be a control that silently discards its value.
 */

type TabId = "tours" | "experiences" | "transfers";

const tabs: { id: TabId; label: string }[] = [
  { id: "tours", label: "Tours" },
  { id: "experiences", label: "Experiences" },
  { id: "transfers", label: "Transfers" },
];

/** Quick links under the panel — the searches people actually run. */
const popular: { label: string; href: string }[] = [
  { label: "White Island", href: "/tours/white-island" },
  { label: "Ras Mohamed", href: "/tours/ras-mohamed" },
  { label: "Desert safari", href: "/experiences/desert" },
  { label: "Pyramids day trip", href: "/destinations/cairo" },
  { label: "Airport transfer", href: "/experiences/private-transfers" },
];

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("tours");
  const [destination, setDestination] = useState("all");
  const [category, setCategory] = useState("all");
  const [duration, setDuration] = useState("all");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (destination !== "all") q.set("destination", destination);
    if (tab === "transfers") {
      // The transfers tab is a shortcut to a type, not a separate index.
      q.set("type", "transfer");
    } else {
      if (category !== "all") q.set("category", category);
      if (duration !== "all") q.set("duration", duration);
    }
    const qs = q.toString();
    router.push(qs ? `/tours?${qs}` : "/tours");
  }

  return (
    <div className="w-full">
      {/* ---------- Tabs ---------- */}
      <div role="tablist" aria-label="Search type" className="flex gap-1">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-t-[0.75rem] px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-[var(--duration-ui)]",
                active
                  ? "bg-paper text-ink"
                  : "bg-ink/35 text-paper/80 backdrop-blur-sm hover:bg-ink/50 hover:text-paper",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ---------- Panel ---------- */}
      <form
        onSubmit={submit}
        className="rounded-[0.75rem] rounded-tl-none bg-paper p-3 shadow-[var(--shadow-panel)] sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-0">
          <Field label="Destination" className="lg:flex-1">
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-label="Destination"
              className="search-select"
            >
              <option value="all">Anywhere in Egypt</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          {tab !== "transfers" ? (
            <>
              <Divider />
              <Field label="Experience" className="lg:flex-1">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Experience type"
                  className="search-select"
                >
                  <option value="all">Any experience</option>
                  {experiences.map((x) => (
                    <option key={x.slug} value={x.slug}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Divider />
              <Field label="Duration" className="lg:flex-1">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  aria-label="Duration"
                  className="search-select"
                >
                  <option value="all">Any length</option>
                  {durationBuckets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : (
            <>
              <Divider />
              <Field label="Service" className="lg:flex-[2]">
                <p className="px-3 py-2 text-[0.9375rem] text-stone">
                  Airport and private transfers
                </p>
              </Field>
            </>
          )}

          <button type="submit" className="btn btn-primary w-full lg:ml-3 lg:w-auto">
            Search
            <span className="arrow" aria-hidden>
              →
            </span>
          </button>
        </div>
      </form>

      {/* ---------- Popular ---------- */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-paper/60">
          Popular
        </span>
        {popular.map((p) => (
          <a
            key={p.href}
            href={p.href}
            className="rounded-pill border border-paper/30 px-3.5 py-1.5 text-[0.8125rem] text-paper/90 transition-colors duration-[var(--duration-ui)] hover:border-paper hover:bg-paper hover:text-ink"
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="block px-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-stone">
        {label}
      </span>
      {children}
    </label>
  );
}

/** Hairline between fields — desktop only, where the row is horizontal. */
function Divider() {
  return <span aria-hidden className="hidden w-px self-stretch bg-sand lg:block" />;
}
