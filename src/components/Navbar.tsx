"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSite } from "./SiteProvider";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./sections";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./ui/Logo";

/**
 * Modern floating pill navigation matching the reference design:
 * - Desktop: Floating pill header with Logo, icons+labels navigation items, language switcher, and Book button
 * - Mobile: Fixed bottom floating pill dock with Home, Search, Contact, Videos, and About
 */
const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5 12 3l9 7.5v10a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20.5v-10Z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    label: "Search",
    href: "/tours",
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7.5" />
        <path d="m16.5 16.5 4.5 4.5" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        <path d="M10 10.5c.5.5 1.5 1.5 2 2" strokeWidth="2.2" />
      </svg>
    ),
  },
  {
    label: "Videos",
    href: "/video",
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="13" height="12" x="2.5" y="6" rx="2.5" />
        <path d="m15.5 10 5.5-3.5v11L15.5 14v-4Z" />
      </svg>
    ),
  },
  {
    label: "About",
    href: "/about",
    icon: (
      <svg
        className="size-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9.5" />
        <line x1="12" x2="12" y1="7.5" y2="12.5" />
        <circle cx="12" cy="16" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function Navbar() {
  const { settings: site, whatsappLink } = useSite();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ─── Desktop Top Floating Header ─── */}
      <header className="fixed inset-x-0 top-0 z-[100] px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none transition-all duration-300">
        <div
          className={cn(
            "max-w-6xl mx-auto flex items-center justify-between pointer-events-auto rounded-full bg-white/95 backdrop-blur-md border border-sand/50 shadow-md px-4 sm:px-5 lg:px-6 py-1.5 transition-all duration-300 gap-3",
            scrolled ? "shadow-lg border-sand/70 py-1" : "shadow-md py-1.5",
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="shrink-0 transition-opacity hover:opacity-85"
          >
            <Logo tone="ink" />
          </Link>

          {/* Center Pill Nav (Streamlined, compact horizontal links) */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full transition-all duration-200 group cursor-pointer text-xs font-semibold tracking-wide",
                    active
                      ? "text-sun font-bold bg-sun/10"
                      : "text-stone-700 hover:text-ink hover:bg-paper-warm/50",
                  )}
                >
                  <div
                    className={cn(
                      "transition-transform duration-200 group-hover:scale-110",
                      active ? "text-sun" : "text-stone-600 group-hover:text-ink",
                    )}
                  >
                    {item.icon}
                  </div>
                  <span className="leading-none">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Language Switcher + Book on WhatsApp */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitcher tone="ink" />
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3.5 sm:px-4 rounded-full bg-sun hover:bg-sun-bright text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md shrink-0 whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <WhatsAppIcon className="size-3.5 shrink-0" />
              <span>
                Book <span className="hidden xl:inline">on WhatsApp</span>
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── Mobile Floating Pill Dock (Exact match to Reference Screenshot) ─── */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-5 inset-x-4 max-w-sm sm:max-w-md mx-auto z-[100] rounded-full bg-white/95 backdrop-blur-xl border border-sand/60 shadow-[0_16px_48px_rgba(15,65,74,0.18)] px-5 py-2.5 flex items-center justify-between lg:hidden"
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 group cursor-pointer min-w-[52px]",
                active ? "text-[#e05328] font-bold scale-105" : "text-stone-700 hover:text-ink",
              )}
            >
              <div
                className={cn(
                  "transition-colors",
                  active ? "text-[#e05328]" : "text-stone-700 group-hover:text-ink",
                )}
              >
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
