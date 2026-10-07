"use client";

/**
 * First-load preloader: a little boat bobbing on the Red Sea under a rising sun.
 *
 * It is part of the server HTML, so it covers the page from the very first
 * paint, and hides itself once the page has loaded (never sooner than a short
 * minimum so it doesn't flash). A pure-CSS fallback fades it out after a few
 * seconds even if JavaScript never runs, so it can never trap a visitor. The
 * admin is excluded, and reduced-motion visitors get a static version.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "./SiteProvider";

const MIN_VISIBLE_MS = 900;

export function Preloader() {
  const pathname = usePathname();
  const { settings } = useSite();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - started));
      timer = setTimeout(() => setHidden(true), wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div
      className="preloader"
      data-hidden={hidden}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      aria-hidden={hidden}
    >
      <div className="preloader__scene">
        <div className="preloader__sun" />
        <svg className="preloader__boat" viewBox="0 0 120 90" fill="none" aria-hidden>
          <path d="M60 6v54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M64 10c20 10 32 28 34 46H64V10Z" fill="currentColor" opacity="0.92" />
          <path d="M56 22c-12 8-20 22-22 34h22V22Z" fill="currentColor" opacity="0.6" />
          <path d="M14 62h92l-12 18a8 8 0 0 1-6.6 3.5H32.6A8 8 0 0 1 26 80L14 62Z" fill="var(--color-sun)" />
        </svg>
        <div className="preloader__waves" aria-hidden>
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="preloader__wave preloader__wave--back">
            <path d="M0 30c100 0 100-20 200-20s100 20 200 20 100-20 200-20 100 20 200 20 100-20 200-20 100 20 200 20v30H0Z" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="preloader__wave preloader__wave--front">
            <path d="M0 30c100 0 100-20 200-20s100 20 200 20 100-20 200-20 100 20 200 20 100-20 200-20 100 20 200 20v30H0Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <p className="preloader__name">{settings.name}</p>
      <div className="preloader__bar" aria-hidden>
        <span />
      </div>
    </div>
  );
}
