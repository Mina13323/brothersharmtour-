"use client";

import { useEffect, useRef, useState } from "react";
import { TourCard } from "./cards";
import type { Tour } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Horizontal snap rail for tours.
 *
 * On mobile this is the primary discovery pattern — a rail beats a tall stack
 * of cards because it keeps the next item visible and the section short. On
 * desktop it gains arrow controls and a progress rule.
 *
 * Scrolling is native (CSS scroll-snap + overflow), so it stays smooth and
 * costs no JS on the scroll path; the observer only updates arrow state.
 */
export function TourRail({ tours, sizes }: { tours: Tour[]; sizes?: string }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = railRef.current;
    if (!node) return;

    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      setAtStart(node.scrollLeft <= 4);
      setAtEnd(node.scrollLeft >= max - 4);
      setProgress(max > 0 ? node.scrollLeft / max : 0);
    };

    update();
    node.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      node.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scrollBy(dir: 1 | -1) {
    const node = railRef.current;
    if (!node) return;
    const card = node.querySelector("li");
    const step = card ? card.clientWidth + 24 : node.clientWidth * 0.8;
    node.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <div>
      <ul ref={railRef} className="rail" role="list">
        {tours.map((tour) => (
          <li
            key={tour.slug}
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw] xl:w-[26rem]"
          >
            <TourCard tour={tour} sizes={sizes} />
          </li>
        ))}
      </ul>

      {/* Desktop controls + progress */}
      <div className="mt-8 hidden items-center gap-6 md:flex">
        <div className="h-px grow bg-sand">
          <span
            className="block h-px origin-left bg-ink transition-transform duration-300 ease-[var(--ease-premium)]"
            style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }}
          />
        </div>

        <div className="flex gap-2">
          <RailButton
            label="Previous tours"
            disabled={atStart}
            onClick={() => scrollBy(-1)}
          >
            ←
          </RailButton>
          <RailButton label="More tours" disabled={atEnd} onClick={() => scrollBy(1)}>
            →
          </RailButton>
        </div>
      </div>
    </div>
  );
}

function RailButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-pill border text-[0.875rem] transition-all duration-[var(--duration-ui)] ease-[var(--ease-premium)]",
        disabled
          ? "cursor-not-allowed border-sand text-stone-soft"
          : "border-ink/25 hover:border-ink hover:bg-ink hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}
