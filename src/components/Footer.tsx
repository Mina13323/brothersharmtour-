import Link from "next/link";
import { footerNav, site, whatsappLink } from "@/data/site";
import { Logo } from "./ui/Logo";
import { WhatsAppIcon } from "./sections";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-ink bg-ink text-paper">
      <div className="shell">
        {/* ---- Brand row ---- */}
        <div className="grid gap-12 border-b border-ink-line py-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-6 max-w-xs font-display text-[1.75rem] leading-tight text-paper">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/55">
              Curated tours, excursions and private transfers across Sharm El
              Sheikh and Cairo — run by a team that lives on the Red Sea.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5"
          >
            <FooterColumn title="Destinations" links={footerNav.destinations} />
            <FooterColumn title="Experiences" links={footerNav.experiences} />
            <FooterColumn title="Company" links={footerNav.company} />
          </nav>

          <div className="lg:col-span-3">
            <h3 className="eyebrow text-paper/45">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-sun"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.contact.phone}`}
                  className="transition-colors hover:text-sun"
                >
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="transition-colors hover:text-sun"
                >
                  {site.contact.email}
                </a>
              </li>
              <li className="text-paper/55">{site.contact.base}</li>
              <li className="text-paper/55">{site.contact.hours}</li>
            </ul>

            <ul className="mt-6 flex gap-3">
              <li>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bro Tour on Instagram"
                  className="grid size-10 place-items-center rounded-pill border border-ink-line transition-colors hover:border-sun hover:text-sun"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.64.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.94c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.18.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.18.22.55.47.94.88 1.35.41.41.8.66 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.18-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.75-.07Zm0 3.3a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 7.59a2.99 2.99 0 1 0 0-5.98 2.99 2.99 0 0 0 0 5.98Zm5.86-7.79a1.08 1.08 0 1 1-2.15 0 1.08 1.08 0 0 1 2.15 0Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bro Tour on Facebook"
                  className="grid size-10 place-items-center rounded-pill border border-ink-line transition-colors hover:border-sun hover:text-sun"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.54-1.5h1.65V4.63c-.29-.04-1.27-.13-2.4-.13-2.38 0-4 1.45-4 4.12v2.28H7.5V14h2.79v8h3.21Z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ---- Legal row ---- */}
        <div className="flex flex-col gap-4 py-8 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/faq" className="transition-colors hover:text-paper">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-paper">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/tours" className="transition-colors hover:text-paper">
                All tours
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="eyebrow text-paper/45">{title}</h3>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-paper/80 transition-colors hover:text-sun"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
