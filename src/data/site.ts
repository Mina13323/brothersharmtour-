/** Global site configuration — brand, contact channels, navigation. */

export const site = {
  name: "Brother Sharm Tour",
  legalName: "Brother Sharm Tour Egypt",
  tagline: "Explore Egypt Differently.",
  description:
    "Brother Sharm Tour runs curated tours, excursions and private transfers across Sharm El Sheikh and Cairo — the Red Sea, the Sinai desert and Egypt's ancient wonders, guided by people who live there.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://brothersharmtour.com",
  locale: "en",
  contact: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "201042441923",
    phone: process.env.NEXT_PUBLIC_PHONE ?? "+20 10 4244 1923",
    email: process.env.NEXT_PUBLIC_EMAIL ?? "contact@brothersharmtour.com",
    base: "Sharm El Sheikh, South Sinai, Egypt",
    hours: "Daily · 08:00 – 23:00 (EET)",
  },
  social: {
    instagram: "https://instagram.com/brothersharmtour",
    facebook: "https://facebook.com/brothersharmtour",
  },
} as const;

/** Builds a pre-filled WhatsApp deep link. */
export function whatsappLink(message?: string) {
  const text = encodeURIComponent(
    message ?? "Hi Brother Sharm Tour — I'd like to plan a trip in Egypt.",
  );
  return `https://wa.me/${site.contact.whatsapp}?text=${text}`;
}

export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  /** Renders the mega panel with an image rail rather than a plain list. */
  feature?: { label: string; href: string; image: string; caption: string };
}

export const mainNav: NavItem[] = [
  {
    label: "Destinations",
    href: "/destinations",
    children: [
      {
        label: "Sharm El Sheikh",
        href: "/destinations/sharm-el-sheikh",
        description: "Red Sea, reefs and the Sinai desert",
      },
      {
        label: "Cairo",
        href: "/destinations/cairo",
        description: "Pyramids, the Grand Egyptian Museum and Old Cairo",
      },
    ],
    feature: {
      label: "Sharm El Sheikh",
      href: "/destinations/sharm-el-sheikh",
      image: "/media/destinations/sharm-el-sheikh.jpg",
      caption: "Our home base — and where most of our experiences run.",
    },
  },
  {
    label: "Experiences",
    href: "/experiences",
    children: [
      {
        label: "Sea & Water",
        href: "/experiences/sea-water",
        description: "Snorkelling, islands and boat days",
      },
      {
        label: "Adventure",
        href: "/experiences/adventure",
        description: "Speed, height and open water",
      },
      {
        label: "Desert",
        href: "/experiences/desert",
        description: "Sinai dunes, canyons and Bedouin camps",
      },
      {
        label: "Culture",
        href: "/experiences/culture",
        description: "Ancient sites, markets and city life",
      },
      {
        label: "Wildlife",
        href: "/experiences/wildlife",
        description: "Dolphins and the reef's residents",
      },
      {
        label: "Leisure",
        href: "/experiences/leisure",
        description: "Evenings out, cafés and promenades",
      },
      {
        label: "Private Transfers",
        href: "/experiences/private-transfers",
        description: "Airport pickups and door-to-door cars",
      },
    ],
  },
  { label: "Tours", href: "/tours" },
  { label: "Video", href: "/video" },
  { label: "About", href: "/about" },
];

export const footerNav = {
  destinations: [
    { label: "Sharm El Sheikh", href: "/destinations/sharm-el-sheikh" },
    { label: "Cairo", href: "/destinations/cairo" },
  ],
  experiences: [
    { label: "Sea & Water", href: "/experiences/sea-water" },
    { label: "Adventure", href: "/experiences/adventure" },
    { label: "Desert", href: "/experiences/desert" },
    { label: "Culture", href: "/experiences/culture" },
    { label: "Wildlife", href: "/experiences/wildlife" },
    { label: "Leisure", href: "/experiences/leisure" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "All Tours", href: "/tours" },
    { label: "Video", href: "/video" },
  ],
};
