"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./BookingProvider";
import { WhatsAppIcon } from "./sections";
import { useSite } from "./SiteProvider";
import { childAgeBand, infantAgeBand } from "@/lib/utils";
import type { BookingOptions } from "./BookingProvider";
import type { Tour, TripPackage } from "@/lib/types";

/**
 * Sticky booking bar for tour pages — appears once the hero scrolls away, so a
 * "book" action is always one tap from reach. Mirrors the persistent booking
 * bar on the reference site. Opens the global booking drawer pre-filled.
 */
export function StickyBookBar({
  tour,
  selectedPackage,
  bookingOptions,
}: {
  tour: Tour;
  selectedPackage?: TripPackage | null;
  bookingOptions?: BookingOptions;
}) {
  const { open } = useBooking();
  const { money, t } = useSite();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 450);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isUnit = selectedPackage?.pricingMode === "unit";
  const price = selectedPackage ? selectedPackage.adultPrice : tour.priceFrom;
  const childPrice = selectedPackage
    ? (selectedPackage.childPrice ?? null)
    : tour.childPrice;

  return (
    <div
      className={`fixed z-[95] transition-all duration-300 [transition-timing-function:var(--ease-out-expo)] ${
        show
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-6 opacity-0 pointer-events-none"
      } inset-x-3 bottom-[calc(5.25rem+max(0px,env(safe-area-inset-bottom,0px)))] max-w-xl mx-auto rounded-2xl border border-sand/80 bg-paper/98 p-3 shadow-curved backdrop-blur-md lg:inset-x-0 lg:bottom-0 lg:max-w-none lg:rounded-none lg:border-x-0 lg:border-b-0 lg:border-t lg:p-0`}
    >
      <div className="shell flex items-center justify-between gap-4 py-1 sm:py-2 lg:py-3">
        <div className="min-w-0">
          <p className="truncate text-[0.8rem] sm:text-sm font-medium text-ink">
            {tour.title}
            {selectedPackage ? (
              <span className="font-normal text-stone ml-1">· {selectedPackage.title}</span>
            ) : null}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 text-[0.8rem] text-stone">
            {price !== null ? (
              <>
                <span className="font-display font-semibold text-[1.05rem] text-ink">
                  {/* Pinned overrides apply to the tour's base adult price only —
                      resolved from the record's own stored currency. */}
                  {money(price, selectedPackage ? undefined : tour.priceOverrides, tour.currency)}
                </span>{" "}
                <span className="text-stone/90 text-xs">
                  {isUnit ? `/ ${selectedPackage?.unitLabel?.trim() || "item"}` : `(${t("price_adult", "Adult")})`}
                </span>
                {!isUnit && typeof childPrice === "number" && childPrice >= 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-sand/90">·</span>
                    <span className="font-display font-semibold text-ink text-sm">
                      {money(childPrice, undefined, tour.currency)}
                    </span>
                    <span className="text-stone/90 text-xs">
                      ({t("price_child", "Child")} {childAgeBand(tour)})
                    </span>
                  </span>
                )}
                {isUnit ? null : (() => {
                  const infant = selectedPackage
                    ? (selectedPackage.infantPrice ?? tour.infantPrice ?? 0)
                    : (tour.infantPrice ?? 0);
                  return (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-sand/90">·</span>
                      <span className="font-display font-semibold text-ink text-sm">
                        {infant === 0 ? t("free", "Free") : money(infant, undefined, tour.currency)}
                      </span>
                      <span className="text-stone/90 text-xs">
                        ({t("price_infant_label", "Infant")} {infantAgeBand(tour)})
                      </span>
                    </span>
                  );
                })()}
                <span className="hidden sm:inline text-stone/80">· {t("pay_on_day", "pay on the day")}</span>
              </>
            ) : (
              <span>{t("price_on_request", "Price on request")}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => open(tour.slug, bookingOptions)}
          className="btn btn-primary btn-sm shrink-0 shadow-sm"
        >
          <WhatsAppIcon className="size-4" />
          {t("nav_book_now", "Book now")}
        </button>
      </div>
    </div>
  );
}
