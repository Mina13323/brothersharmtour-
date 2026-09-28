"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./BookingProvider";
import { WhatsAppIcon } from "./sections";
import { money, tourPriceUnit } from "@/lib/utils";
import type { Tour } from "@/lib/types";

/**
 * Sticky booking bar for tour pages — appears once the hero scrolls away, so a
 * "book" action is always one tap from reach. Mirrors the persistent booking
 * bar on the reference site. Opens the global booking drawer pre-filled.
 */
export function StickyBookBar({ tour }: { tour: Tour }) {
  const { open } = useBooking();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const price = tour.priceFrom;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[90] border-t border-sand bg-paper/95 backdrop-blur-md transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="shell flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[0.8rem] font-medium text-ink">
            {tour.title}
          </p>
          <p className="text-[0.8rem] text-stone">
            {price !== null ? (
              <>
                <span className="font-display text-[1.05rem] text-ink">
                  {money(price)}
                </span>{" "}
                {tourPriceUnit(tour)} · pay on the day
              </>
            ) : (
              "Price on request"
            )}
          </p>
        </div>
        <button
          onClick={() => open(tour.slug)}
          className="btn btn-primary btn-sm shrink-0"
        >
          <WhatsAppIcon className="size-4" />
          Book now
        </button>
      </div>
    </div>
  );
}
