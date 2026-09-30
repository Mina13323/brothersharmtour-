"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * SmoothScroll component:
 * 1. Smooth scroll-to-anchor handling with navbar offset compensation (80px).
 * 2. Visual scroll progress indicator along the top edge of the viewport.
 * 3. Enforces smooth scrolling behavior on the root HTML element.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update scroll progress bar on scroll
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = Math.min(
              1,
              Math.max(0, window.scrollY / totalHeight),
            );
            setScrollProgress(progress);
          } else {
            setScrollProgress(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Intercept anchor clicks for smooth scrolling with navbar offset
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Handle pure hash links or same-page hash links (e.g. "/#reviews" when on "/")
      let hash = "";
      if (href.startsWith("#")) {
        hash = href;
      } else if (href.startsWith("/#") && (pathname === "/" || pathname === "")) {
        hash = href.slice(1);
      }

      if (hash && hash !== "#") {
        const el = document.querySelector(hash);
        if (el) {
          e.preventDefault();
          const navOffset = 84;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - navOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });

          // Update URL hash without jumping
          if (window.history.pushState) {
            window.history.pushState(null, "", hash);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-[2.5px] origin-left bg-gradient-to-r from-reef-deep via-sun to-reef transition-transform duration-100 ease-out"
      style={{
        transform: `scaleX(${scrollProgress})`,
        opacity: scrollProgress > 0.005 ? 1 : 0,
      }}
    />
  );
}
