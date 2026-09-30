"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * FAQ accordion. Uses real buttons + aria-expanded rather than <details> so
 * the open/close transition can be animated with grid-template-rows (which
 * avoids the max-height guesswork and never clips long answers).
 */
export function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items.length) return null;

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div
            key={item.question}
            className={cn(
              "overflow-hidden rounded-2xl border transition-all duration-400",
              expanded
                ? "border-reef-deep/30 bg-paper shadow-sm"
                : "border-sand/70 bg-paper/60 hover:bg-paper hover:border-sand hover:shadow-xs",
            )}
          >
            <h3>
              <button
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
              >
                <span
                  className={cn(
                    "font-display text-[1.2rem] sm:text-[1.35rem] leading-snug transition-colors duration-400",
                    expanded ? "text-reef font-medium" : "text-ink",
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-400 shadow-xs",
                    expanded
                      ? "rotate-45 border-reef bg-reef text-paper"
                      : "border-ink/20 text-stone bg-paper-warm/50",
                  )}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 [transition-timing-function:var(--ease-editorial)]",
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl px-5 pb-5 text-[0.9375rem] leading-relaxed text-stone">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
