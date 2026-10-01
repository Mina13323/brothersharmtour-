"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "./SiteProvider";
import { cn } from "@/lib/utils";
import { useBooking } from "./BookingProvider";
import { WhatsAppIcon } from "./sections";

/**
 * Floating conversion layer.
 *
 * Desktop: a single WhatsApp button, bottom-right, after the fold.
 * Mobile: a floating curved dock pairing WhatsApp with the primary booking CTA,
 * because on a phone the header CTA scrolls away and thumb reach matters more
 * than chrome purity. Hidden until the user has scrolled past the hero so it
 * never competes with the hero's own CTAs. Suppressed on tour detail pages to
 * yield cleanly to StickyBookBar.
 */
export function FloatingActions() {
  const { whatsappLink } = useSite();
  const pathname = usePathname();
  const { isOpen } = useBooking();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const isTourDetail = pathname.startsWith("/tours/") && pathname !== "/tours";

  return (
    <>
      {/* Desktop */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Brother Sharm Tour on WhatsApp"
        className={cn(
          "fixed bottom-7 right-7 z-[90] hidden size-14 place-items-center rounded-pill bg-[#1faa54] text-white shadow-lg transition-all duration-500 hover:scale-105 md:grid",
          visible && !isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <WhatsAppIcon className="size-6" />
      </a>

      {/* Mobile dock is replaced by the floating pill navbar */}
    </>
  );
}
