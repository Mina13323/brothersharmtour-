"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BookingWidget } from "./BookingWidget";
import { useSite } from "./SiteProvider";
import type { PackageSelection } from "@/lib/types";

export interface BookingOptions {
  tripPackageId?: string;
  adults?: number;
  children?: number;
  infants?: number;
  /** Several options booked together, each with its own party. */
  selections?: PackageSelection[];
}

interface BookingContextValue {
  open: (tourSlug?: string, options?: BookingOptions) => void;
  close: () => void;
  isOpen: boolean;
  tourSlug?: string;
  initialOptions?: BookingOptions;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

/**
 * Global booking drawer. Any CTA anywhere on the site can open the inquiry
 * flow pre-filled with a tour, without that page needing its own form state.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const { t } = useSite();
  const [isOpen, setIsOpen] = useState(false);
  const [tourSlug, setTourSlug] = useState<string | undefined>();
  const [initialOptions, setInitialOptions] = useState<BookingOptions | undefined>();

  const open = useCallback((slug?: string, options?: BookingOptions) => {
    setTourSlug(slug);
    setInitialOptions(options);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInitialOptions(undefined);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, close]);

  const value = useMemo(
    () => ({ open, close, isOpen, tourSlug, initialOptions }),
    [open, close, isOpen, tourSlug, initialOptions],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[120] ${isOpen ? "" : "pointer-events-none"}`}
      >
        {/* Scrim */}
        <button
          tabIndex={isOpen ? 0 : -1}
          aria-label={t("booking_close_panel", "Close booking panel")}
          onClick={close}
          className={`absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <div
          role="dialog"
          aria-modal={isOpen}
          aria-label={t("booking_request_cta", "Request a booking")}
          className={`absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col overflow-hidden rounded-t-[2rem] border-l border-sand/80 bg-paper shadow-2xl transition-transform duration-[600ms] [transition-timing-function:var(--ease-out-expo)] md:rounded-t-none md:rounded-l-[2.5rem] ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <header className="flex items-start justify-between gap-6 border-b border-sand px-6 py-6 md:px-9">
            <div>
              <p className="eyebrow text-reef">{t("booking_in_3_minutes", "Book in 3 minutes")}</p>
              <h2 className="headline mt-2 text-[1.75rem]">{t("booking_reserve_trip", "Reserve your trip")}</h2>
            </div>
            <button
              onClick={close}
              aria-label={t("action_close", "Close")}
              className="mt-1 grid size-10 shrink-0 place-items-center rounded-pill border border-ink/15 transition-colors hover:bg-ink hover:text-paper"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </header>

          <div className="grow overflow-y-auto px-6 pt-6 pb-0 md:px-9 md:pt-8 md:pb-0">
            {isOpen ? (
              <BookingWidget initialTour={tourSlug} initialOptions={initialOptions} onClose={close} />
            ) : null}
          </div>
        </div>
      </div>
    </BookingContext.Provider>
  );
}

/** Convenience CTA that opens the global booking drawer. */
export function BookButton({
  tourSlug,
  options,
  className = "btn btn-primary",
  children = "Book Now",
}: {
  tourSlug?: string;
  options?: BookingOptions;
  className?: string;
  children?: ReactNode;
}) {
  const { open } = useBooking();
  return (
    <button type="button" onClick={() => open(tourSlug, options)} className={className}>
      {children}
    </button>
  );
}
