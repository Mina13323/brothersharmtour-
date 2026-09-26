import { media } from "@/lib/media";
import type { Experience, ExperienceSlug } from "@/lib/types";

/**
 * Experience categories. These are the discovery layer that sits between a
 * destination and an individual tour — a traveller who knows the mood they
 * want ("something in the desert") but not the specific trip.
 */
export const experiences: Experience[] = [
  {
    name: "Sea & Water",
    slug: "sea-water",
    tagline: "Islands, reefs and long days on the water",
    description:
      "Boat days out to the sandbanks and coral gardens of the Red Sea — snorkelling stops, glass-bottom viewing and the protected reefs of Ras Mohamed.",
    image: media.tiranIsland.card,
    destinations: ["sharm-el-sheikh"],
    seo: {
      title: "Sharm El Sheikh Sea Trips & Snorkelling",
      description:
        "Red Sea boat trips and snorkelling from Sharm El Sheikh with Bro Tour, including White Island, Ras Mohamed National Park and Tiran Island.",
      keywords: [
        "sharm el sheikh sea trips",
        "sharm el sheikh snorkeling",
        "red sea excursions",
        "sharm el sheikh boat trips",
        "white island trip",
      ],
    },
    priority: 1,
  },
  {
    name: "Adventure",
    slug: "adventure",
    tagline: "Speed, height and open water",
    description:
      "For travellers who want the adrenaline version of Sharm — parasailing above the bay, speed boats across the gulf and horses along the shoreline.",
    image: media.parasailing.card,
    destinations: ["sharm-el-sheikh"],
    seo: {
      title: "Sharm El Sheikh Adventure Tours",
      description:
        "Adventure tours from Sharm El Sheikh with Bro Tour: quad biking, Color Canyon, horse riding and Super Safari across the Sinai desert.",
      keywords: [
        "sharm el sheikh adventure tours",
        "quad biking sharm el sheikh",
        "color canyon trip",
        "horse riding sharm el sheikh",
      ],
    },
    priority: 2,
  },
  {
    name: "Desert",
    slug: "desert",
    tagline: "Sinai mountains, canyons and Bedouin fires",
    description:
      "The other half of Sharm. Quad bikes across open desert, the layered walls of the Coloured Canyon, and tea with Bedouin hosts under a sky full of stars.",
    image: media.colorCanyon.card,
    destinations: ["sharm-el-sheikh"],
    seo: {
      title: "Sharm El Sheikh Desert Safari Tours",
      description:
        "Desert safari from Sharm El Sheikh with Bro Tour, crossing the Sinai interior to Bedouin camps, with Safari and Super Safari options.",
      keywords: [
        "sharm el sheikh desert safari",
        "sinai desert tours",
        "bedouin experience sharm",
        "super safari sharm el sheikh",
      ],
    },
    priority: 3,
  },
  {
    name: "Culture",
    slug: "culture",
    tagline: "Ancient Egypt, markets and city life",
    description:
      "Giza, the Grand Egyptian Museum and the old streets of Cairo — plus the everyday culture closer to home in Sharm's Old Market.",
    image: media.pyramids.card,
    destinations: ["cairo", "sharm-el-sheikh"],
    seo: {
      title: "Egypt Cultural Tours from Sharm El Sheikh",
      description:
        "Cultural tours with Bro Tour taking in the Pyramids of Giza, the Grand Egyptian Museum and Old Cairo, reachable from Sharm El Sheikh.",
      keywords: [
        "egypt cultural tours",
        "pyramids tours",
        "grand egyptian museum tours",
        "old cairo tours",
      ],
    },
    priority: 4,
  },
  {
    name: "Wildlife",
    slug: "wildlife",
    tagline: "Dolphins and the residents of the reef",
    description:
      "Time on the water with the Red Sea's most charismatic wildlife, and family-friendly ways to see it up close.",
    image: media.dolphinSwim.card,
    destinations: ["sharm-el-sheikh"],
    seo: {
      title: "Red Sea Marine Life & Dolphin Experiences",
      description:
        "Marine life experiences in Sharm El Sheikh with Bro Tour, including dolphin encounters, the submarine and glass boat trips over the reef.",
      keywords: [
        "dolphin experiences sharm el sheikh",
        "swimming with dolphins egypt",
        "glass boat sharm",
        "submarine sharm el sheikh",
      ],
    },
    priority: 5,
  },
  {
    name: "Leisure",
    slug: "leisure",
    tagline: "Evenings, cafés and the slow version of Sharm",
    description:
      "Soho Square after dark, the promenade at Naama Bay and a cliffside table at Farsha — the parts of Sharm you enjoy at walking pace.",
    image: media.farshaCafe.card,
    destinations: ["sharm-el-sheikh"],
    seo: {
      title: "Sharm El Sheikh Leisure & Evening Experiences",
      description:
        "Relaxed Sharm El Sheikh outings with Bro Tour: Naama Bay, the Old Market, Soho Square and the cliffside Farsha Cafe.",
      keywords: [
        "things to do in sharm el sheikh at night",
        "naama bay",
        "soho square sharm",
        "old market sharm el sheikh",
      ],
    },
    priority: 6,
  },
  {
    name: "Private Transfers",
    slug: "private-transfers",
    tagline: "Doors, airports and everything between",
    description:
      "Private, fixed-price cars with a driver — airport arrivals and departures, hotel-to-restaurant runs and full days at your disposal.",
    image: media.transfer.card,
    destinations: ["sharm-el-sheikh", "cairo"],
    seo: {
      title: "Sharm El Sheikh Airport Transfers & Private Transport",
      description:
        "Private transfers and Sharm El Sheikh airport transport with Bro Tour, arranged for your arrival, departure and trips between hotels.",
      keywords: [
        "sharm el sheikh airport transfers",
        "private transfers egypt",
        "sharm airport taxi",
        "egypt private transport",
      ],
    },
    priority: 7,
  },
];

export const experienceBySlug = (slug: string) =>
  experiences.find((e) => e.slug === slug);

export const experienceName = (slug: ExperienceSlug) =>
  experiences.find((e) => e.slug === slug)?.name ?? slug;
