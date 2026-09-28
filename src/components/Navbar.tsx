"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./sections";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./ui/Logo";

/**
 * Slim header modelled on sharmtours.org: logo + wordmark on the left, a short
 * flat link set, the language switch and a WhatsApp primary action on the right.
 * Transparent over a hero, solid on scroll, and it hides on downward scroll to
 * keep the CTA reachable on long pages.
 */
const links = [
  { label: "Tours", href: "/tours" },
  { label: "Video", href: "/video" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  const overHero =
    pathname === "/" ||
    pathname.startsWith("/destinations/") ||
    pathname.startsWith("/tours/") ||
    pathname.startsWith("/experiences/") ||
    pathname === "/about" ||
    pathname === "/video";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 600 && y > lastY.current && !mobileOpen);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solid = scrolled || !overHero || mobileOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-[transform,background-color,border-color] duration-500",
        "[transition-timing-function:var(--ease-editorial)]",
        hidden ? "-translate-y-full" : "translate-y-0",
        solid
          ? "border-b border-sand bg-paper/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell">
        <div
          className={cn(
            "flex items-center justify-between gap-6 transition-[height] duration-500",
            solid ? "h-[64px] md:h-[70px]" : "h-[72px] md:h-[84px]",
          )}
        >
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="relative z-10 shrink-0"
          >
            <Logo tone={solid ? "ink" : "light"} />
          </Link>

          {/* Desktop links */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {links.map((item) => {
                const active =
                  item.href.startsWith("/#")
                    ? false
                    : pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative inline-flex h-10 items-center px-3.5 text-[0.8125rem] font-medium tracking-[0.03em] transition-colors",
                        solid ? "text-ink" : "text-white",
                        active && "font-semibold",
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute inset-x-3.5 bottom-1.5 h-px origin-left scale-x-0 bg-current transition-transform duration-500",
                          "[transition-timing-function:var(--ease-out-expo)]",
                          active && "scale-x-100",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher tone={solid ? "ink" : "light"} className="hidden sm:block" />
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm hidden sm:inline-flex"
            >
              <WhatsAppIcon className="size-4" />
              Book on WhatsApp
            </a>

            {/* Mobile trigger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className={cn(
                "relative z-10 grid size-11 place-items-center lg:hidden",
                solid || mobileOpen ? "text-ink" : "text-white",
              )}
            >
              <span className="flex w-6 flex-col gap-[5px]">
                <span className={cn("h-px w-full bg-current transition-transform duration-400", mobileOpen && "translate-y-[6px] rotate-45")} />
                <span className={cn("h-px w-full bg-current transition-opacity duration-300", mobileOpen && "opacity-0")} />
                <span className={cn("h-px w-full bg-current transition-transform duration-400", mobileOpen && "-translate-y-[6px] -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 top-0 z-[-1] flex h-[100dvh] flex-col bg-paper pt-[64px] transition-[opacity,visibility] duration-400 lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="grow overflow-y-auto overscroll-contain px-5 pb-8 pt-4">
          <ul className="flex flex-col">
            {links.map((item, i) => (
              <li key={item.label} className="border-b border-sand">
                <Link
                  href={item.href}
                  style={{ transitionDelay: mobileOpen ? `${80 + i * 45}ms` : "0ms" }}
                  className={cn(
                    "block py-4 font-display text-[1.75rem] transition-[opacity,transform] duration-600 [transition-timing-function:var(--ease-out-expo)]",
                    mobileOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp w-full"
            >
              <WhatsAppIcon className="size-5" />
              Book on WhatsApp
            </a>
            <div className="pt-1">
              <LanguageSwitcher tone="ink" />
            </div>
          </div>

          <div className="mt-10 space-y-1 text-sm text-stone">
            <p>{site.contact.base}</p>
            <p>
              <a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a>
            </p>
            <p>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
