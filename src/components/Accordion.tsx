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
    <ul className="border-t border-sand">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <li key={item.question} className="border-b border-sand">
            <h3>
              <button
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                className="flex w-full items-start justify-between gap-6 py-6 text-left"
              >
                <span
                  className={cn(
                    "font-display text-[1.25rem] leading-snug transition-colors duration-400 md:text-[1.4rem]",
                    expanded && "text-reef",
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 grid size-7 shrink-0 place-items-center rounded-pill border transition-all duration-500",
                    expanded
                      ? "rotate-45 border-reef text-reef"
                      : "border-ink/20 text-stone",
                  )}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.3" />
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
                <p className="max-w-2xl pb-7 pr-10 text-[0.9375rem] leading-relaxed text-stone">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
