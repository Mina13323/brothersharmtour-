"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mainNav, site } from "@/data/site";
import { cn } from "@/lib/utils";
import { useBooking } from "./BookingProvider";
import { Logo } from "./ui/Logo";

/**
 * Header behaviour
 * - Transparent over a hero, solid once scrolled past 24px.
 * - Hides on downward scroll past 600px, returns on upward scroll — keeps the
 *   CTA within reach on long listing pages without occupying the viewport.
 * - Desktop mega panel on hover + focus; mobile full-screen sheet.
 */
export function Navbar() {
  const pathname = usePathname();
  const { open } = useBooking();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Pages that start with a full-bleed dark hero get the transparent header. */
  const overHero =
    pathname === "/" ||
    pathname.startsWith("/destinations/") ||
    pathname.startsWith("/tours/") ||
    pathname.startsWith("/experiences/") ||
    pathname === "/about";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 600 && y > lastY.current && openMenu === null);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [openMenu]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solid = scrolled || !overHero || openMenu !== null;

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

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
      onMouseLeave={scheduleClose}
    >
      <div className="shell">
        <div
          className={cn(
            "flex items-center justify-between gap-6 transition-[height] duration-500",
            solid ? "h-[68px] md:h-[76px]" : "h-[76px] md:h-[92px]",
          )}
        >
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="relative z-10 shrink-0"
          >
            <Logo tone={solid ? "ink" : "light"} />
          </Link>

          {/* ---------- Desktop navigation ---------- */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li
                    key={item.label}
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMenu(item.children ? item.label : null);
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={item.children ? openMenu === item.label : undefined}
                      className={cn(
                        "relative inline-flex h-11 items-center px-4 text-[0.8125rem] font-medium tracking-[0.04em] transition-colors",
                        solid ? "text-ink" : "text-white",
                        active && "font-semibold",
                      )}
                      onFocus={() => setOpenMenu(item.children ? item.label : null)}
                    >
                      {item.label}
                      <span
                        className={cn(
                          "absolute inset-x-4 bottom-2 h-px origin-left scale-x-0 bg-current transition-transform duration-500",
                          "[transition-timing-function:var(--ease-out-expo)]",
                          (active || openMenu === item.label) && "scale-x-100",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => open()}
              className={cn(
                "btn btn-sm hidden sm:inline-flex",
                solid ? "btn-primary" : "btn-ghost-light",
              )}
            >
              Book Now
            </button>

            {/* ---------- Mobile trigger ---------- */}
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
                <span
                  className={cn(
                    "h-px w-full bg-current transition-transform duration-400",
                    mobileOpen && "translate-y-[6px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "h-px w-full bg-current transition-opacity duration-300",
                    mobileOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "h-px w-full bg-current transition-transform duration-400",
                    mobileOpen && "-translate-y-[6px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Desktop mega panel ---------- */}
      {mainNav
        .filter((i) => i.children)
        .map((item) => (
          <div
            key={item.label}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className={cn(
              "absolute inset-x-0 top-full hidden overflow-hidden border-b border-sand bg-paper lg:block",
              "transition-[max-height,opacity] duration-500 [transition-timing-function:var(--ease-editorial)]",
              openMenu === item.label
                ? "max-h-[32rem] opacity-100"
                : "pointer-events-none max-h-0 opacity-0",
            )}
          >
            <div className="shell grid grid-cols-12 gap-10 py-10">
              <div className="col-span-3">
                <p className="eyebrow text-stone">{item.label}</p>
                <Link href={item.href} className="link-rule mt-5 inline-flex text-ink">
                  View all
                  <Arrow />
                </Link>
              </div>

              <ul
                className={cn(
                  "col-span-5 grid gap-x-8 gap-y-1",
                  (item.children?.length ?? 0) > 4 ? "grid-cols-2" : "grid-cols-1",
                )}
              >
                {item.children?.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="group block border-b border-sand/70 py-3 transition-colors last:border-0 hover:border-ink"
                    >
                      <span className="block font-display text-[1.35rem] leading-tight transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-1.5">
                        {child.label}
                      </span>
                      {child.description ? (
                        <span className="mt-0.5 block text-[0.8125rem] text-stone">
                          {child.description}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>

              {item.feature ? (
                <Link
                  href={item.feature.href}
                  className="group col-span-4 flex flex-col gap-4"
                >
                  <div className="media aspect-[16/10] w-full">
                    <Image
                      src={item.feature.image}
                      alt=""
                      fill
                      sizes="(max-width: 1280px) 30vw, 380px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-display text-xl">{item.feature.label}</p>
                    <p className="mt-1 text-[0.8125rem] text-stone">
                      {item.feature.caption}
                    </p>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        ))}

      {/* ---------- Mobile sheet ---------- */}
      <div
        className={cn(
          "fixed inset-0 top-0 z-[-1] flex h-[100dvh] flex-col bg-paper pt-[68px] transition-[opacity,visibility] duration-400 lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav
          aria-label="Mobile"
          className="grow overflow-y-auto overscroll-contain px-5 pb-8 pt-4"
        >
          <ul className="flex flex-col">
            {mainNav.map((item, i) => (
              <li key={item.label} className="border-b border-sand">
                <MobileItem item={item} index={i} open={mobileOpen} />
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => open()} className="btn btn-primary w-full">
              Book Now
            </button>
            <Link href="/contact" className="btn btn-outline w-full">
              Contact us
            </Link>
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

function MobileItem({
  item,
  index,
  open,
}: {
  item: (typeof mainNav)[number];
  index: number;
  open: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{ transitionDelay: open ? `${80 + index * 45}ms` : "0ms" }}
      className={cn(
        "transition-[opacity,transform] duration-600 [transition-timing-function:var(--ease-out-expo)]",
        open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <div className="flex items-center justify-between">
        <Link href={item.href} className="block py-4 font-display text-[1.75rem]">
          {item.label}
        </Link>
        {item.children ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
            aria-expanded={expanded}
            className="grid size-10 place-items-center text-stone"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className={cn(
                "transition-transform duration-400",
                expanded && "rotate-45",
              )}
            >
              <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        ) : null}
      </div>

      {item.children ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-editorial)]",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <ul className="overflow-hidden">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className="block py-2.5 pl-4 text-[0.9375rem] text-stone"
                >
                  {child.label}
                </Link>
              </li>
            ))}
            <li className="pb-4" />
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Arrow() {
  return (
    <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
      <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
