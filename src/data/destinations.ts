import { media } from "@/lib/media";
import type { Destination } from "@/lib/types";

/**
 * Destinations. Sharm El Sheikh is the primary destination (priority 1) —
 * it is Bro Tour's home base and where the majority of experiences run.
 * Cairo is secondary, reached as a day trip or as a stay in its own right.
 */
export const destinations: Destination[] = [
  {
    name: "Sharm El Sheikh",
    slug: "sharm-el-sheikh",
    tagline: "Explore the Red Sea",
    intro:
      "Reefs that start a few metres from the shore, a desert that begins where the hotels end, and a town that runs late. Sharm is where Bro Tour is based and where most of what we run takes place.",
    overview: [
      "Sharm El Sheikh sits at the southern tip of the Sinai peninsula, on the strip of coast where the Gulf of Aqaba opens into the Red Sea. That position is the reason for everything else: deep water close inshore, reefs in extraordinary condition, and mountains directly behind the town.",
      "Most visitors see the beach and the hotel. The town is considerably more than that — Ras Mohamed National Park to the south, the reefs of the Strait of Tiran to the north-east, the Sinai interior inland, and the Old Market, where Sharm does its own shopping.",
      "We live here. That means we know which reef is worth your morning when the wind turns, which evening at the Old Market is the good one, and how long the drive to the canyon really takes.",
    ],
    heroImage: media.sharmHero,
    heroVideo: media.heroFilm,
    cardImage: media.sharmDestination,
    gallery: [
      media.whiteIsland.hero,
      media.tiranIsland.card,
      media.colorCanyon.card,
      media.superSafari.hero,
      media.parasailing.card,
      media.farshaCafe.card,
      media.rasMohamed.card,
      media.dolphinSwim.card,
    ],
    experiences: [
      "sea-water",
      "adventure",
      "desert",
      "wildlife",
      "leisure",
      "culture",
      "private-transfers",
    ],
    highlights: [
      {
        title: "White Island",
        blurb: "A sandbank that surfaces mid-sea when the tide drops.",
        image: media.whiteIsland.card,
      },
      {
        title: "Ras Mohamed",
        blurb: "Egypt's first national park, where the desert meets a reef wall.",
        image: media.rasMohamed.card,
      },
      {
        title: "Tiran Island",
        blurb: "Coral gardens in the strait between Sinai and Saudi Arabia.",
        image: media.tiranIsland.card,
      },
      {
        title: "Coloured Canyon",
        blurb: "Banded sandstone corridors in the Sinai interior.",
        image: media.colorCanyon.card,
      },
      {
        title: "Bedouin Desert Camps",
        blurb: "Fires, bread and a sky with no light pollution in it.",
        image: media.superSafari.card,
      },
      {
        title: "Naama Bay",
        blurb: "The original seafront promenade, best after dark.",
        image: media.naamaBay.card,
      },
      {
        title: "Soho Square",
        blurb: "An open-air square built around a fountain show.",
        image: media.sohoSquare.card,
      },
      {
        title: "Farsha Cafe",
        blurb: "Cliffside terraces stepping down towards the water.",
        image: media.farshaCafe.card,
      },
      {
        title: "Old Market",
        blurb: "Spice, craft and textile lanes where the town shops.",
        image: media.oldMarket.card,
      },
    ],
    travelInfo: [
      { label: "Airport", value: "Sharm El Sheikh International (SSH)" },
      { label: "Region", value: "South Sinai, Egypt" },
      { label: "Getting around", value: "Private transfers and taxis; most tours include hotel pickup" },
      { label: "Currency", value: "Egyptian Pound (EGP). Cards are widely accepted in resorts" },
      { label: "Language", value: "Arabic, with English spoken throughout the tourism sector" },
      { label: "Best for", value: "Snorkelling, desert trips, family travel and diving" },
    ],
    seo: {
      title: "Sharm El Sheikh Tours & Excursions",
      description:
        "Book Sharm El Sheikh tours and Red Sea excursions with Bro Tour: White Island, Ras Mohamed, Tiran Island, desert safari, Color Canyon and private transfers.",
      keywords: [
        "sharm el sheikh tours",
        "sharm el sheikh excursions",
        "things to do in sharm el sheikh",
        "sharm el sheikh activities",
        "red sea tours",
      ],
    },
    priority: 1,
  },
  {
    name: "Cairo",
    slug: "cairo",
    tagline: "Discover Ancient Egypt",
    intro:
      "The Pyramids, the Sphinx and the Grand Egyptian Museum on one side of the river; a thousand years of streets, mosques and markets on the other.",
    overview: [
      "Cairo is the counterweight to the Red Sea. Where Sharm is water and desert, Cairo is density — a city of more than twenty million people wrapped around the Nile, with the Giza plateau on its western edge.",
      "The monuments are the reason most travellers come, and they deserve the billing. But the older quarters are what people remember: the Coptic churches, the medieval streets of Islamic Cairo, and the bazaar that has been trading in the same lanes for centuries.",
      "We run Cairo as a day trip by air from Sharm El Sheikh, or as guided days for travellers already staying in the city.",
    ],
    heroImage: media.cairoHero,
    cardImage: media.cairoDestination,
    gallery: [
      media.pyramids.hero,
      media.sphinx.card,
      media.gem.card,
      media.oldCairo.card,
      media.pyramids.card,
    ],
    experiences: ["culture", "private-transfers"],
    highlights: [
      {
        title: "The Pyramids of Giza",
        blurb: "The last of the ancient wonders still standing.",
        image: media.pyramids.card,
      },
      {
        title: "The Great Sphinx",
        blurb: "Carved from the bedrock of the plateau itself.",
        image: media.sphinx.card,
      },
      {
        title: "Grand Egyptian Museum",
        blurb: "The largest museum in the world devoted to one civilisation.",
        image: media.gem.card,
      },
      {
        title: "Old Cairo",
        blurb: "Coptic churches, medieval streets and the covered bazaar.",
        image: media.oldCairo.card,
      },
    ],
    travelInfo: [
      { label: "Airport", value: "Cairo International (CAI)" },
      { label: "From Sharm El Sheikh", value: "Day trips run by air; timings follow the flight schedule" },
      { label: "Getting around", value: "Private car with driver is the practical option for visitors" },
      { label: "Dress", value: "Shoulders and knees covered at religious sites" },
      { label: "Best for", value: "Ancient sites, museums and city walking" },
    ],
    seo: {
      title: "Cairo Tours & Pyramids Day Trips from Sharm El Sheikh",
      description:
        "Cairo tours with Bro Tour covering the Pyramids of Giza, the Grand Egyptian Museum and Old Cairo, available as a day trip from Sharm El Sheikh.",
      keywords: [
        "cairo tours",
        "cairo day trips",
        "giza pyramids tours",
        "grand egyptian museum tour",
        "old cairo tour",
      ],
    },
    priority: 2,
  },
];

export const destinationBySlug = (slug: string) =>
  destinations.find((d) => d.slug === slug);

export const destinationName = (slug: string) =>
  destinations.find((d) => d.slug === slug)?.name ?? slug;
