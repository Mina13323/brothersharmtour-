"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { durationBuckets, durationBucketLabel } from "@/lib/store/labels";
import { cn } from "@/lib/utils";
import { useCatalogue, useSite } from "./SiteProvider";
import { destinationName, experienceName } from "@/lib/store/labels";

/**
 * BROTHER SHARM TOUR — hero search
 *
 * A tabbed search panel that sits over the hero and hands off to /tours with
 * the filters pre-applied.
 *
 * Every control here maps to a filter the tours page actually implements.
 * A guests stepper was deliberately left out: nothing downstream consumes a
 * headcount, so it would be a control that silently discards its value.
 */

type TabId = "tours" | "experiences" | "transfers";

export function HeroSearch() {
  const { t, lang } = useSite();
  const catalogue = useCatalogue();
  const destinationOptions = Array.from(new Set(catalogue.map((t) => t.destination)));
  const categoryOptions = Array.from(new Set(catalogue.map((t) => t.category)));
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("tours");

  const popular = [
    { label: "White Island", href: "/tours/white-island" },
    { label: "Ras Mohamed", href: "/tours/ras-mohamed" },
    // Place names stay as they are; the descriptive labels are localized.
    { label: experienceName("desert", lang), href: "/experiences/desert" },
    { label: t("popular_pyramids_day_trip", "Pyramids day trip"), href: "/destinations/cairo" },
    {
      label: t("popular_airport_transfer", "Airport transfer"),
      href: "/experiences/private-transfers",
    },
    { label: t("nav_packages", "Packages"), href: "/packages" },
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: "tours", label: t("tab_tours", "Tours") },
    { id: "experiences", label: t("tab_experiences", "Experiences") },
    { id: "transfers", label: t("tab_transfers", "Transfers") },
  ];
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
      <div className="flex justify-center mb-3">
        <div
          role="tablist"
          aria-label={t("aria_search_type", "Search type")}
          className="inline-flex rounded-full bg-paper/95 backdrop-blur-md p-1 border border-sand/60 shadow-sm"
        >
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
                  "rounded-full px-5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-ink text-white shadow-sm"
                    : "text-stone hover:text-ink hover:bg-black/5",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Floating Pill Search Dock ---------- */}
      <form
        onSubmit={submit}
        className="bg-white rounded-3xl lg:rounded-full p-2.5 sm:p-3 shadow-[0_20px_50px_rgba(15,65,74,0.15)] border border-sand/60 flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-0"
      >
        {/* Field 1: Where */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 hover:bg-paper-warm/30 rounded-2xl lg:rounded-full transition-colors cursor-pointer group">
          <div className="size-9 rounded-full bg-paper flex items-center justify-center text-reef shrink-0 group-hover:bg-sand/30 transition-colors">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
              {t("search_where", "Where")}
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-label={t("search_where", "Where")}
              className="w-full bg-transparent text-sm font-semibold text-ink border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">{t("search_choose_dest", "Choose a destination")}</option>
              {destinationOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {destinationName(slug, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden lg:block w-px h-10 bg-sand/60 mx-1 shrink-0" />

        {/* Field 2: Experience / Service */}
        {tab !== "transfers" ? (
          <div className="flex-1 flex items-center gap-3 px-4 py-2 hover:bg-paper-warm/30 rounded-2xl lg:rounded-full transition-colors cursor-pointer group">
            <div className="size-9 rounded-full bg-paper flex items-center justify-center text-reef shrink-0 group-hover:bg-sand/30 transition-colors">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
                {t("search_experience", "Experience")}
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label={t("search_experience", "Experience")}
                className="w-full bg-transparent text-sm font-semibold text-ink border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer truncate"
              >
                <option value="all">{t("search_select_exp", "Select experience")}</option>
                {categoryOptions.map((slug) => (
                  <option key={slug} value={slug}>
                    {experienceName(slug, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-3 px-4 py-2 hover:bg-paper-warm/30 rounded-2xl lg:rounded-full transition-colors cursor-pointer group">
            <div className="size-9 rounded-full bg-paper flex items-center justify-center text-reef shrink-0 group-hover:bg-sand/30 transition-colors">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
                {t("search_service", "Service")}
              </span>
              <p className="text-sm font-semibold text-ink truncate">
                {t("private_transfer", "Airport & Private Transfers")}
              </p>
            </div>
          </div>
        )}

        <div className="hidden lg:block w-px h-10 bg-sand/60 mx-1 shrink-0" />

        {/* Field 3: Duration */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2 hover:bg-paper-warm/30 rounded-2xl lg:rounded-full transition-colors cursor-pointer group">
          <div className="size-9 rounded-full bg-paper flex items-center justify-center text-reef shrink-0 group-hover:bg-sand/30 transition-colors">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
              {t("label_duration", "Duration")}
            </span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              aria-label={t("label_duration", "Duration")}
              className="w-full bg-transparent text-sm font-semibold text-ink border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">{t("duration_flexible", "Any length")}</option>
              {durationBuckets.map((b) => (
                <option key={b.id} value={b.id}>
                  {durationBucketLabel(b.id, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-ink hover:bg-reef text-white px-8 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer shrink-0 lg:ml-2"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="text-sm tracking-wide">{t("search_submit", "Search")}</span>
        </button>
      </form>

      {/* ---------- Popular ---------- */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-stone font-semibold mr-1">
          {t("hero_popular", "Popular:")}
        </span>
        {popular.map((p) => (
          <a
            key={p.href}
            href={p.href}
            className="rounded-full bg-white/80 hover:bg-white text-ink hover:text-reef px-3.5 py-1.5 text-xs font-medium border border-sand/50 shadow-xs hover:shadow-sm hover:scale-105 transition-all duration-200"
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}
