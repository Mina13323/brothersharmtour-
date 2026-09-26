import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/cormorant-garamond";
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingProvider } from "@/components/BookingProvider";
import { FloatingActions } from "@/components/FloatingActions";
import { site } from "@/data/site";
import { OG_IMAGE } from "@/lib/media";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Tours & Experiences in Sharm El Sheikh and Cairo`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Sharm El Sheikh tours",
    "Red Sea excursions",
    "Egypt day trips",
    "Ras Mohamed snorkelling",
    "White Island",
    "Tiran Island",
    "Sinai desert safari",
    "Cairo day trip from Sharm",
    "Sharm El Sheikh airport transfer",
  ],
  authors: [{ name: site.legalName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Explore Egypt Differently`,
    description: site.description,
    url: site.url,
    locale: "en_GB",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${site.name}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Explore Egypt Differently`,
    description: site.description,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Organisation + site-level structured data. */
function OrganisationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${site.url}/#organisation`,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    slogan: site.tagline,
    image: `${site.url}${OG_IMAGE}`,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sharm El Sheikh",
      addressRegion: "South Sinai",
      addressCountry: "EG",
    },
    areaServed: [
      { "@type": "City", name: "Sharm El Sheikh" },
      { "@type": "City", name: "Cairo" },
    ],
    sameAs: [site.social.instagram, site.social.facebook],
  };

  return (
    <script
      type="application/ld+json"
       
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/*
          No-JS fallback for the scroll-reveal system.

          `.reveal` starts at opacity 0 and `.lines > span` starts pushed down
          behind a mask; both are resolved by IntersectionObserver. With
          scripting disabled that never happens, so this forces the end state.

          This used to be a `no-js` class on <html> stripped by an inline
          script. That mutates the DOM before React hydrates, so the server
          markup and the client tree disagree and React reports a hydration
          mismatch. A <noscript> block needs no script, mutates nothing, and
          applies in exactly the case it is meant to.
        */}
        <noscript>
          <style>{`
            .reveal, .reveal[data-variant] {
              opacity: 1 !important;
              transform: none !important;
              clip-path: none !important;
            }
            .lines > .line > span { transform: none !important; }
          `}</style>
        </noscript>
        <OrganisationSchema />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>

        <BookingProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <FloatingActions />
        </BookingProvider>
      </body>
    </html>
  );
}
