"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";
import { useBooking } from "./BookingProvider";
import { WhatsAppIcon } from "./sections";

/**
 * Floating conversion layer.
 *
 * Desktop: a single WhatsApp button, bottom-right, after the fold.
 * Mobile: a fixed bottom bar pairing WhatsApp with the primary booking CTA,
 * because on a phone the header CTA scrolls away and thumb reach matters more
 * than chrome purity. Hidden until the user has scrolled past the hero so it
 * never competes with the hero's own CTAs.
 */
export function FloatingActions() {
  const { open, isOpen } = useBooking();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Bro Tour on WhatsApp"
        className={cn(
          "fixed bottom-7 right-7 z-[90] hidden size-14 place-items-center rounded-pill bg-[#1faa54] text-white shadow-lg transition-all duration-500 hover:scale-105 md:grid",
          visible && !isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <WhatsAppIcon className="size-6" />
      </a>

      {/* Mobile bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[90] flex gap-2 border-t border-sand bg-paper/96 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 [transition-timing-function:var(--ease-editorial)] md:hidden",
          visible && !isOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp shrink-0 px-5"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="size-[1.1rem]" />
        </a>
        <button onClick={() => open()} className="btn btn-primary grow">
          Book Now
        </button>
      </div>
    </>
  );
}
