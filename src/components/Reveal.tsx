"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Motion vocabulary — see docs/design-research.md §8 and globals.css. */
export type RevealVariant = "fade" | "clip" | "clip-up" | "rise";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in ms — keep under ~240 so sections never feel slow. */
  delay?: number;
  as?: ElementType;
  /** Fires once when this fraction of the element is visible. */
  threshold?: number;
  /**
   * `fade`    — default text/content lift
   * `clip`    — horizontal wipe, for editorial imagery
   * `clip-up` — vertical uncover
   * `rise`    — larger settle, for feature blocks
   */
  variant?: RevealVariant;
}

/**
 * Scroll reveal. Progressive enhancement only: `.reveal` is inert without JS
 * (see the `.no-js` guard in globals.css), the observer disconnects after the
 * first intersection, and `prefers-reduced-motion` short-circuits to the end
 * state before any observer is created.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  threshold = 0.12,
  variant = "fade",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    /**
     * Safety net. `.reveal` starts at opacity 0, so if the observer never
     * fires — an element taller than the viewport that can't reach the
     * threshold, a browser quirk, a hydration hiccup — the content would stay
     * invisible and leave a blank gap on the page. Never let that happen.
     */
    const fallback = window.setTimeout(() => setShown(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      data-variant={variant === "fade" ? undefined : variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Line-by-line headline reveal.
 *
 * Each line is masked by its own wrapper and slides up from beneath it, 70ms
 * apart. Reserved for major editorial headlines — the brief is explicit that
 * body copy must not animate.
 *
 * Accessibility: the full string stays in the accessible tree as a single
 * visually-hidden node, so screen readers never hear it fragmented, and the
 * animated lines are marked aria-hidden.
 */
export function SplitHeadline({
  lines,
  className,
  as: Tag = "span",
  delay = 0,
  threshold = 0.2,
}: {
  lines: string[];
  className?: string;
  as?: ElementType;
  delay?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);

    /* Same safety net as <Reveal> — a headline masked at translateY(105%)
       that never resolves would render as an empty band of whitespace. */
    const fallback = window.setTimeout(() => setShown(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold]);

  return (
    <Tag ref={ref} data-shown={shown} className={cn("lines", className)}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <span className="line" key={line + i} aria-hidden="true">
          <span
            style={
              {
                "--i": i,
                transitionDelay: delay
                  ? `calc(${delay}ms + ${i} * var(--stagger-line))`
                  : undefined,
              } as React.CSSProperties
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
