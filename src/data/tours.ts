import { media } from "@/lib/media";
import type { Tour } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * OPERATIONS NOTE
 *
 * Prices, durations and itinerary timings below are STRUCTURAL PLACEHOLDERS.
 * They exist so the interface can be designed and tested against realistic
 * data shapes. Every record is flagged `verified: false` until Bro Tour
 * operations confirms the commercial detail.
 *
 * Nothing here should go live unchanged. Query `tours.filter(t => !t.verified)`
 * to list everything still awaiting sign-off.
 *
 * Tours with `priceFrom: null` render as "Price on request" — proof the UI
 * degrades gracefully when a field genuinely has no confirmed value.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Terms that apply to every Bro Tour booking unless a tour overrides them. */
const baseIncluded = [
  "Hotel pickup and drop-off in an air-conditioned vehicle",
  "English-speaking Bro Tour guide",
  "All entrance fees and permits listed in the itinerary",
  "Bottled water",
];

const baseExcluded = [
  "Personal expenses and souvenirs",
  "Gratuities (optional, always appreciated)",
  "Travel insurance",
];

const baseImportant = [
  "Bring your passport or a photo of it — some checkpoints ask for ID.",
  "Sun protection, a hat and flat shoes make every trip more comfortable.",
  "Pickup times shift slightly by hotel zone; we confirm yours the evening before.",
];

const baseFaq = [
  {
    question: "How do I confirm a booking?",
    answer:
      "Send a request through the site or message us on WhatsApp. We reply with availability, the exact pickup time for your hotel and the final price before you commit to anything.",
  },
  {
    question: "Can this run as a private trip?",
    answer:
      "Most of our experiences can. Tell us your group size and preferred date and we'll quote the private version alongside the shared one.",
  },
  {
    question: "What happens if the weather changes?",
    answer:
      "Sea trips depend on conditions. If the coastguard closes the marina or a trip can't run safely, we move you to another date or refund in full.",
  },
];

export const tours: Tour[] = [
  /* ══════════════════════════ SEA & WATER ══════════════════════════ */
  {
    title: "White Island Sandbank",
    slug: "white-island",
    destination: "sharm-el-sheikh",
    category: "sea-water",
    type: "group",
    summary:
      "A boat morning out to the sandbank that appears in the middle of the sea, with snorkelling stops on the reefs either side of it.",
    description: [
      "White Island isn't an island so much as a bright strip of sand that surfaces out of open water when the tide drops. There is nothing on it — no shade, no buildings, no jetty — which is exactly why it is worth the crossing.",
      "The trip is built around the tide. We leave the marina in the morning, take the reef stops first, then anchor off the sandbank at the point in the day when the most sand is exposed and the water around it is at its clearest.",
    ],
    images: [media.whiteIsland.hero, ...media.whiteIsland.gallery],
    duration: "Half day",
    durationHours: 5,
    priceFrom: 45,
    currency: "USD",
    highlights: [
      "Walk out onto a sandbank surrounded by open sea",
      "Two snorkelling stops over shallow, sheltered reef",
      "Small-boat trip rather than a large group cruise",
      "Time in the water scheduled around the tide, not the clock",
    ],
    included: [...baseIncluded, "Snorkelling mask, fins and vest", "Lunch on board"],
    excluded: [...baseExcluded, "Underwater camera hire"],
    itinerary: [
      {
        time: "Morning",
        title: "Hotel pickup",
        detail:
          "Collected from your hotel in Sharm and driven to the marina. Exact time is confirmed the night before.",
      },
      {
        title: "Crossing and first reef stop",
        detail:
          "Boat out to the first snorkelling site, with a briefing on entry, exit and reef etiquette before anyone gets in.",
      },
      {
        title: "White Island",
        detail:
          "Anchor off the sandbank. Time to wade across it, swim and photograph before the tide starts covering it again.",
      },
      {
        title: "Lunch on board",
        detail: "Served on deck between stops while we reposition.",
      },
      {
        title: "Return to the marina",
        detail: "Back to the harbour and transferred to your hotel.",
      },
    ],
    meetingPoint:
      "Hotel pickup across Sharm El Sheikh — Naama Bay, Nabq, Sharks Bay, Hadaba and Old Market.",
    importantInfo: [
      ...baseImportant,
      "The sandbank is tidal. On a high tide it can be reduced to a narrow strip — we plan departures around this but cannot control it.",
      "There is no shade at the sandbank itself. Reef-safe sunscreen is strongly recommended.",
    ],
    faq: baseFaq,
    related: ["ras-mohamed", "tiran-island", "glass-boat"],
    verified: false,
    featured: true,
    priority: 1,
  },
  {
    title: "Ras Mohamed National Park",
    slug: "ras-mohamed",
    destination: "sharm-el-sheikh",
    category: "sea-water",
    type: "group",
    summary:
      "Egypt's first national park, where the Sinai desert ends in a vertical reef wall. Snorkelling in one of the Red Sea's most protected marine areas.",
    description: [
      "Ras Mohamed sits at the southern tip of the Sinai peninsula, where the Gulf of Suez and the Gulf of Aqaba meet. It became Egypt's first national park in 1983, and the protection shows — the reef here is dense, steep and busy with fish.",
      "We run it as a boat trip with several stops rather than a single long swim, so you see more than one type of reef in a day.",
    ],
    images: [media.rasMohamed.hero, ...media.rasMohamed.gallery],
    duration: "Full day",
    durationHours: 8,
    priceFrom: 55,
    currency: "USD",
    highlights: [
      "Snorkelling inside a protected national park",
      "Reef walls that drop away into deep blue water",
      "Several stops across different reef systems",
      "Lunch served on board between sites",
    ],
    included: [
      ...baseIncluded,
      "National park entrance fee",
      "Snorkelling equipment",
      "Lunch on board",
    ],
    excluded: baseExcluded,
    itinerary: [
      { time: "Morning", title: "Hotel pickup", detail: "Transfer to the marina." },
      {
        title: "Into the park",
        detail:
          "Boat south along the coast into the national park boundary, with a briefing on the rules that keep the reef intact.",
      },
      {
        title: "Reef stops",
        detail:
          "Snorkelling at the day's selected sites. The captain picks them on the day based on current and wind.",
      },
      { title: "Lunch on board", detail: "Served between the morning and afternoon stops." },
      { title: "Return", detail: "Back to the marina and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Nothing may be removed from the park — no shells, no coral, no sand.",
      "Site selection is decided on the day by the captain according to sea conditions.",
    ],
    faq: baseFaq,
    related: ["white-island", "tiran-island", "submarine"],
    verified: false,
    featured: true,
    priority: 2,
  },
  {
    title: "Tiran Island Snorkelling",
    slug: "tiran-island",
    destination: "sharm-el-sheikh",
    category: "sea-water",
    type: "group",
    summary:
      "A full day in the Strait of Tiran, anchoring over the coral gardens that sit between the Sinai and the Saudi coast.",
    description: [
      "The Strait of Tiran is the narrow channel where the Gulf of Aqaba meets the open Red Sea. Four large reefs sit in the middle of it, and the water moving through the gap keeps them in remarkable condition.",
      "It is the classic Sharm boat day — a long, unhurried one, with several anchorages and plenty of time in the water at each.",
    ],
    images: [media.tiranIsland.hero, ...media.tiranIsland.gallery],
    duration: "Full day",
    durationHours: 8,
    priceFrom: 40,
    currency: "USD",
    highlights: [
      "Anchor over the reefs of the Strait of Tiran",
      "Multiple snorkelling stops in one day",
      "Views across to the mountains of Saudi Arabia",
      "Sun deck and shaded seating on board",
    ],
    included: [...baseIncluded, "Snorkelling equipment", "Lunch on board", "Soft drinks"],
    excluded: baseExcluded,
    itinerary: [
      { time: "Morning", title: "Hotel pickup", detail: "Transfer to the marina and boarding." },
      {
        title: "First anchorage",
        detail: "Out to the strait and the first reef stop of the day.",
      },
      { title: "Lunch on board", detail: "Served on deck at anchor." },
      { title: "Second anchorage", detail: "A second reef with time to swim and snorkel." },
      { title: "Return", detail: "Back into the marina in the late afternoon." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "This is a long day on a boat. Let us know in advance if anyone in your group is prone to seasickness.",
    ],
    faq: baseFaq,
    related: ["ras-mohamed", "white-island", "speed-boat"],
    verified: false,
    featured: true,
    priority: 3,
  },
  {
    title: "Glass Bottom Boat",
    slug: "glass-boat",
    destination: "sharm-el-sheikh",
    category: "sea-water",
    type: "group",
    summary:
      "The reef without getting wet. A short trip over the shallow coral gardens, viewed through the hull — the easiest option for small children and non-swimmers.",
    description: [
      "Not everyone wants to put a mask on, and the reef shouldn't be off-limits because of it. The glass-bottom boat runs over the shallow coral close to shore, where visibility through the hull is at its best.",
      "It is short, calm and works for grandparents and toddlers alike.",
    ],
    images: [media.glassBoat.card],
    duration: "1 hour",
    durationHours: 1,
    priceFrom: 20,
    currency: "USD",
    highlights: [
      "See the reef without swimming",
      "Suited to young children and non-swimmers",
      "Short, calm, close to shore",
      "Shaded seating throughout",
    ],
    included: ["Hotel pickup and drop-off", "Boat ticket", "Bottled water"],
    excluded: baseExcluded,
    itinerary: [
      { title: "Pickup", detail: "Collected from your hotel and driven to the jetty." },
      {
        title: "On the water",
        detail: "Out over the shallow reef with viewing time through the glass panels.",
      },
      { title: "Return", detail: "Back to the jetty and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Visibility through the hull depends on sunlight and sea state — midday trips are usually clearest.",
    ],
    faq: baseFaq,
    related: ["submarine", "white-island", "dolphin-show"],
    verified: false,
    featured: false,
    priority: 10,
  },
  {
    title: "Semi-Submarine Reef Tour",
    slug: "submarine",
    destination: "sharm-el-sheikh",
    category: "sea-water",
    type: "group",
    summary:
      "Descend into a viewing deck below the waterline and watch the reef pass by through panoramic windows — dry, air-conditioned and step-free.",
    description: [
      "The semi-submarine sits on the surface, but its viewing cabin is below it. You sit at eye level with the reef, behind a continuous run of windows, while the vessel tracks slowly along the coral.",
      "It's the most accessible way we offer to see the Red Sea underwater — no swimming, no stairs into the water, no equipment.",
    ],
    images: [media.submarine.card],
    duration: "2 hours",
    durationHours: 2,
    priceFrom: 35,
    currency: "USD",
    highlights: [
      "Below-waterline viewing deck with panoramic windows",
      "Air-conditioned and completely dry",
      "Step-free and accessible",
      "Good for travellers who don't swim",
    ],
    included: ["Hotel pickup and drop-off", "Submarine ticket", "Bottled water"],
    excluded: baseExcluded,
    itinerary: [
      { title: "Pickup", detail: "Hotel pickup and transfer to the boarding point." },
      { title: "Boarding", detail: "Safety briefing and down into the viewing cabin." },
      { title: "Reef run", detail: "Slow pass along the coral with commentary." },
      { title: "Return", detail: "Back to shore and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: baseImportant,
    faq: baseFaq,
    related: ["glass-boat", "ras-mohamed", "dolphin-show"],
    verified: false,
    featured: false,
    priority: 11,
  },

  /* ══════════════════════════ ADVENTURE ══════════════════════════ */
  {
    title: "Parasailing Over the Bay",
    slug: "parasailing",
    destination: "sharm-el-sheikh",
    category: "adventure",
    type: "group",
    summary:
      "Lifted off the back of a boat and flown above the bay. A few minutes of very quiet air with the whole reef line laid out beneath you.",
    description: [
      "Parasailing is the shortest experience we sell and one of the ones people talk about most. You're clipped in on the boat's platform, the canopy fills, and you rise away from the noise of the engine.",
      "From up there the structure of the coast makes sense — you can see where the shallow reef ends and the deep channel starts, in colours you never get from the beach.",
    ],
    images: [media.parasailing.card],
    duration: "Short activity",
    durationHours: 2,
    priceFrom: 30,
    currency: "USD",
    highlights: [
      "Take-off and landing from the boat, not the beach",
      "Aerial view over the reef line and bay",
      "Tandem flights available",
      "No experience required",
    ],
    included: ["Hotel pickup and drop-off", "Safety equipment and briefing", "Boat time"],
    excluded: [...baseExcluded, "Photo and video package"],
    itinerary: [
      { title: "Pickup", detail: "Collected from your hotel and taken to the watersports base." },
      { title: "Briefing and fitting", detail: "Harness fitting and safety brief on the boat." },
      { title: "Flight", detail: "Take off from the platform, fly, and land back on the boat." },
      { title: "Return", detail: "Back to the base and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Flights are weather-dependent and are cancelled or rescheduled if the wind is outside safe limits.",
      "Weight limits apply and are set by the operator's equipment — tell us your group's details when booking.",
    ],
    faq: baseFaq,
    related: ["speed-boat", "tiran-island", "desert-safari"],
    verified: false,
    featured: true,
    priority: 5,
  },
  {
    title: "Speed Boat Coastal Run",
    slug: "speed-boat",
    destination: "sharm-el-sheikh",
    category: "adventure",
    type: "private",
    summary:
      "A small, fast boat and an open stretch of the gulf — with a snorkelling stop somewhere quiet that the big cruise boats don't reach.",
    description: [
      "Large boats go where large boats can go. A speed boat gets you into the small bays along the coast, and gets you there quickly enough that you spend your time in the water rather than travelling to it.",
      "Runs as a private charter, so the route flexes around what your group actually wants to do.",
    ],
    images: [media.speedBoat.card],
    duration: "Flexible",
    durationHours: 3,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Private boat for your group only",
      "Reaches bays the larger boats skip",
      "Flexible route and timing",
      "Snorkelling stop included",
    ],
    included: ["Hotel pickup and drop-off", "Private boat and skipper", "Snorkelling equipment"],
    excluded: [...baseExcluded, "Catering (available on request)"],
    itinerary: [
      { title: "Pickup", detail: "Transfer from your hotel to the marina." },
      { title: "Planning the run", detail: "Agree the route with the skipper based on conditions." },
      { title: "On the water", detail: "Coastal run with a stop to swim and snorkel." },
      { title: "Return", detail: "Back to the marina and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Pricing depends on group size and duration — message us and we'll quote your exact trip.",
    ],
    faq: baseFaq,
    related: ["parasailing", "tiran-island", "white-island"],
    verified: false,
    featured: false,
    priority: 12,
  },
  {
    title: "Horse Riding on the Shore",
    slug: "horse-riding",
    destination: "sharm-el-sheikh",
    category: "adventure",
    type: "group",
    summary:
      "Riding out along the shoreline and into the desert behind it, timed for the last hours of light.",
    description: [
      "A slower kind of adventure. Horses are matched to experience, so complete beginners ride at a walk with a handler alongside while confident riders can open up on the flat.",
      "The late-afternoon slot is the one to take — the light on the water and the mountains behind is the whole point.",
    ],
    images: [media.horseRiding.card],
    duration: "1–2 hours",
    durationHours: 2,
    priceFrom: 30,
    currency: "USD",
    highlights: [
      "Shoreline and desert riding",
      "Horses matched to your riding experience",
      "Beginners welcome, handlers on hand",
      "Sunset slot available",
    ],
    included: ["Hotel pickup and drop-off", "Horse, helmet and guide", "Bottled water"],
    excluded: baseExcluded,
    itinerary: [
      { title: "Pickup", detail: "Transfer from your hotel to the stables." },
      { title: "Matching and briefing", detail: "Meet your horse and run through the basics." },
      { title: "Ride", detail: "Out along the shoreline and into the desert behind it." },
      { title: "Return", detail: "Back to the stables and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Long trousers and closed shoes are essential.",
      "Tell us the riding experience and age of everyone in your group when booking.",
    ],
    faq: baseFaq,
    related: ["desert-safari", "color-canyon", "super-safari"],
    verified: false,
    featured: false,
    priority: 13,
  },

  /* ══════════════════════════ DESERT ══════════════════════════ */
  {
    title: "Super Safari & Bedouin Night",
    slug: "super-safari",
    destination: "sharm-el-sheikh",
    category: "desert",
    type: "group",
    summary:
      "The long version of the desert trip — quad biking, a camel ride, dinner at a Bedouin camp and a sky with no light pollution in it.",
    description: [
      "Super Safari is the full evening. It combines the activities people usually book separately — the quad ride out, the camel leg, the camp — into one run that finishes after dark.",
      "The camp is the part that stays with people. Bread baked on the fire, tea poured from height, and once the generators go quiet, more stars than most visitors have ever seen at once.",
    ],
    images: [media.superSafari.hero, media.superSafari.card],
    duration: "Half day into evening",
    durationHours: 6,
    priceFrom: 45,
    currency: "USD",
    highlights: [
      "Quad bike run into the open desert",
      "Short camel ride",
      "Dinner at a Bedouin camp",
      "Stargazing away from the resort lights",
    ],
    included: [
      ...baseIncluded,
      "Quad bike and safety equipment",
      "Camel ride",
      "Bedouin dinner and tea",
    ],
    excluded: [...baseExcluded, "Alcoholic drinks (not served at the camp)"],
    itinerary: [
      { time: "Afternoon", title: "Hotel pickup", detail: "Driven out of town towards the Sinai interior." },
      { title: "Quad briefing and ride", detail: "Controls and safety, then the ride out across open desert." },
      { title: "Camel ride", detail: "A short leg on camelback near the camp." },
      { title: "Bedouin camp", detail: "Dinner, tea and time by the fire as the light goes." },
      { title: "Stargazing", detail: "Camp lights down for the sky." },
      { title: "Return", detail: "Drive back into Sharm and on to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Desert evenings get genuinely cold. Bring a jacket even in summer.",
      "A scarf or buff is worth having for the quad section — it is dusty.",
    ],
    faq: baseFaq,
    related: ["desert-safari", "color-canyon", "horse-riding"],
    verified: false,
    featured: true,
    priority: 4,
  },
  {
    title: "Desert Safari by Quad",
    slug: "desert-safari",
    destination: "sharm-el-sheikh",
    category: "desert",
    type: "group",
    summary:
      "The shorter desert run — quad bikes out into the Sinai, a stop for tea, and back before dinner.",
    description: [
      "The stripped-back version of the desert trip for people who want the ride itself rather than a whole evening. Out into the open, a stop at a Bedouin tent for tea, and back.",
      "Morning and late-afternoon departures. The afternoon one gives you the better light.",
    ],
    images: [media.desertSafari.card, ...media.desertSafari.gallery],
    duration: "Half day",
    durationHours: 4,
    priceFrom: 25,
    currency: "USD",
    highlights: [
      "Quad bike ride across open desert",
      "Tea stop at a Bedouin tent",
      "Morning or sunset departures",
      "No licence or experience needed",
    ],
    included: [...baseIncluded, "Quad bike and safety equipment", "Bedouin tea"],
    excluded: baseExcluded,
    itinerary: [
      { title: "Pickup", detail: "Collected from your hotel and driven to the desert base." },
      { title: "Briefing", detail: "Controls, safety and a short practice loop." },
      { title: "The ride", detail: "Out into the open desert in convoy with a guide." },
      { title: "Tea stop", detail: "Break at a Bedouin tent." },
      { title: "Return", detail: "Ride back to base and transfer to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Closed shoes are required to ride. Bring a scarf for the dust and sunglasses.",
      "Minimum age and solo-riding rules are set by the operator — ask us when booking for children.",
    ],
    faq: baseFaq,
    related: ["super-safari", "color-canyon", "horse-riding"],
    verified: false,
    featured: false,
    priority: 14,
  },
  {
    title: "Coloured Canyon & Dahab",
    slug: "color-canyon",
    destination: "sharm-el-sheikh",
    category: "desert",
    type: "group",
    summary:
      "A day trip north into the Sinai interior to walk the Coloured Canyon, with time in Dahab on the way back.",
    description: [
      "The Coloured Canyon is a narrow sandstone corridor where the rock is banded in rust, ochre and violet — the result of mineral deposits laid down over a very long time. You walk through it rather than look at it from above.",
      "Because it's a long drive north, we pair it with Dahab: a slower, low-rise town on the coast where the afternoon is spent at a table by the water.",
    ],
    images: [media.colorCanyon.hero, media.colorCanyon.card],
    duration: "Full day",
    durationHours: 10,
    priceFrom: 55,
    currency: "USD",
    highlights: [
      "Walk the length of the Coloured Canyon",
      "Banded sandstone walls in rust, ochre and violet",
      "Free time on the waterfront in Dahab",
      "Jeep transfer on the final desert section",
    ],
    included: [...baseIncluded, "Jeep transfer to the canyon", "Guide through the canyon", "Lunch"],
    excluded: baseExcluded,
    itinerary: [
      { time: "Early morning", title: "Hotel pickup", detail: "Long drive north along the Gulf of Aqaba." },
      { title: "Jeep transfer", detail: "Swap to 4x4s for the desert track to the canyon entrance." },
      { title: "Canyon walk", detail: "Guided walk through the canyon at a relaxed pace." },
      { title: "Lunch", detail: "Lunch stop before continuing to the coast." },
      { title: "Dahab", detail: "Free time on the waterfront." },
      { title: "Return", detail: "Drive back to Sharm, arriving in the evening." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "This is a long day with several hours of driving in each direction.",
      "The canyon floor is uneven and involves some scrambling — proper shoes matter here.",
    ],
    faq: baseFaq,
    related: ["super-safari", "desert-safari", "horse-riding"],
    verified: false,
    featured: true,
    priority: 6,
  },

  /* ══════════════════════════ WILDLIFE ══════════════════════════ */
  {
    title: "Swim With Dolphins",
    slug: "swim-with-dolphins",
    destination: "sharm-el-sheikh",
    category: "wildlife",
    type: "group",
    summary:
      "Time in the water with dolphins, run in small groups with handlers in the water alongside you throughout.",
    description: [
      "A structured, supervised swim session in small groups. Handlers stay in the water with you, and the session is paced around the animals rather than a fixed timetable.",
      "Booked as a set session with a fixed start time — we'll confirm the slot when you enquire.",
    ],
    images: [media.dolphinSwim.card],
    duration: "Half day",
    durationHours: 4,
    priceFrom: 80,
    currency: "USD",
    highlights: [
      "Small-group swim session",
      "Handlers in the water throughout",
      "Suitable for confident swimmers of most ages",
      "Photography available on site",
    ],
    included: ["Hotel pickup and drop-off", "Entry and session fee", "Use of a life vest"],
    excluded: [...baseExcluded, "Photo and video package"],
    itinerary: [
      { title: "Pickup", detail: "Collected from your hotel at the time confirmed for your session." },
      { title: "Briefing", detail: "Session rules and how to behave in the water." },
      { title: "Swim session", detail: "Your allocated time in the water with the handlers." },
      { title: "Return", detail: "Transfer back to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Sessions are fixed-time and capacity-limited, so book as far ahead as you can.",
      "Sunscreen must be washed off before entering the water.",
    ],
    faq: baseFaq,
    related: ["dolphin-show", "glass-boat", "white-island"],
    verified: false,
    featured: true,
    priority: 7,
  },
  {
    title: "Dolphin Show",
    slug: "dolphin-show",
    destination: "sharm-el-sheikh",
    category: "wildlife",
    type: "group",
    summary:
      "An indoor show with seated viewing and air conditioning — the reliable evening option when you have children and a long hot day behind you.",
    description: [
      "A scheduled performance in a covered arena with tiered seating. It's short, it's cool inside, and it works when the rest of the day has been spent in the sun.",
      "Transfers are timed to the performance you book.",
    ],
    images: [media.dolphinShow.card],
    duration: "Evening",
    durationHours: 2,
    priceFrom: 25,
    currency: "USD",
    highlights: [
      "Covered, air-conditioned arena",
      "Tiered seating with clear sightlines",
      "Family-friendly running time",
      "Transfers timed to the performance",
    ],
    included: ["Hotel pickup and drop-off", "Show ticket"],
    excluded: [...baseExcluded, "Front-row seating upgrade", "Photos with the animals"],
    itinerary: [
      { title: "Pickup", detail: "Collected from your hotel ahead of the performance." },
      { title: "Show", detail: "The performance in the covered arena." },
      { title: "Return", detail: "Transfer back to your hotel." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [...baseImportant, "Performance times vary by day — we confirm yours at booking."],
    faq: baseFaq,
    related: ["swim-with-dolphins", "glass-boat", "soho-square"],
    verified: false,
    featured: false,
    priority: 15,
  },

  /* ══════════════════════════ LEISURE ══════════════════════════ */
  {
    title: "Soho Square Evening",
    slug: "soho-square",
    destination: "sharm-el-sheikh",
    category: "leisure",
    type: "transfer",
    summary:
      "An evening at Sharm's open-air square — fountains, restaurants, an ice bar and a bowling alley — with a private car both ways and no hurry to leave.",
    description: [
      "Soho Square only really starts after dark. It's a pedestrian square built around a fountain show, with restaurants and bars around the edge and a mix of families and couples filling it up through the evening.",
      "We handle it as a transfer rather than a tour: a private car out, an agreed pickup time, and the evening is yours.",
    ],
    images: [media.sohoSquare.card],
    duration: "Evening",
    durationHours: 4,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Private car out and back",
      "Open-air square with fountain shows",
      "Restaurants, cafés and bars around the square",
      "You set the return time",
    ],
    included: ["Private return transfer", "Driver waiting time"],
    excluded: [...baseExcluded, "Food, drinks and any venue entry fees"],
    itinerary: [
      { title: "Pickup", detail: "Private car from your hotel at the time you choose." },
      { title: "Your evening", detail: "Time at the square — dinner, the fountains, the venues around it." },
      { title: "Return", detail: "Driver collects you at the agreed time." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Pricing depends on your hotel zone and group size — message us for an exact quote.",
    ],
    faq: baseFaq,
    related: ["naama-bay", "old-market", "farsha-cafe"],
    verified: false,
    featured: false,
    priority: 16,
  },
  {
    title: "Naama Bay Evening",
    slug: "naama-bay",
    destination: "sharm-el-sheikh",
    category: "leisure",
    type: "transfer",
    summary:
      "The original heart of Sharm — a palm-lined promenade along the water with cafés, shops and a long-running nightlife strip behind it.",
    description: [
      "Naama Bay is where Sharm's tourism started, and it still has the best stretch of seafront promenade in town. It is busy, bright and easy to walk.",
      "Private car out, private car back, at times you set.",
    ],
    images: [media.naamaBay.card],
    duration: "Evening",
    durationHours: 4,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Seafront promenade along the bay",
      "Cafés, restaurants and shopping",
      "Private return transfer",
      "Flexible timing",
    ],
    included: ["Private return transfer", "Driver waiting time"],
    excluded: [...baseExcluded, "Food, drinks and shopping"],
    itinerary: [
      { title: "Pickup", detail: "Private car from your hotel." },
      { title: "Your evening", detail: "Time along the promenade and the streets behind it." },
      { title: "Return", detail: "Collected at the agreed time." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [...baseImportant, "Quoted on request based on hotel zone and group size."],
    faq: baseFaq,
    related: ["soho-square", "old-market", "farsha-cafe"],
    verified: false,
    featured: false,
    priority: 17,
  },
  {
    title: "Farsha Cafe at Sunset",
    slug: "farsha-cafe",
    destination: "sharm-el-sheikh",
    category: "leisure",
    type: "transfer",
    summary:
      "A cliffside café built in terraces down the rock above the Red Sea, with cushions, lanterns and one of the best sunset views in Sharm.",
    description: [
      "Farsha is built into the cliff in Hadaba — a series of terraces and cushioned platforms stepping down towards the water, lit by lanterns once the light drops.",
      "Go for sunset. Arrive before it if you want a good spot on the lower terraces.",
    ],
    images: [media.farshaCafe.card],
    duration: "Evening",
    durationHours: 3,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Terraced cliffside seating above the sea",
      "Lanterns and low cushioned platforms",
      "Sunset over the Gulf of Aqaba",
      "Private car both ways",
    ],
    included: ["Private return transfer", "Driver waiting time"],
    excluded: [...baseExcluded, "Food and drinks"],
    itinerary: [
      { title: "Pickup", detail: "Private car from your hotel, timed to arrive before sunset." },
      { title: "At Farsha", detail: "Time on the terraces." },
      { title: "Return", detail: "Collected at the agreed time." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "The terraces are reached by steps cut into the rock, which makes step-free access difficult.",
      "It fills up at sunset — arriving early is worth it.",
    ],
    faq: baseFaq,
    related: ["naama-bay", "soho-square", "old-market"],
    verified: false,
    featured: false,
    priority: 18,
  },

  /* ══════════════════════════ CULTURE ══════════════════════════ */
  {
    title: "Old Market Walk",
    slug: "old-market",
    destination: "sharm-el-sheikh",
    category: "culture",
    type: "transfer",
    summary:
      "The oldest part of town — spice stalls, craft shops and local restaurants in a grid of lanes that feels a long way from the resort strip.",
    description: [
      "Sharm's Old Market is where the town shops and eats. Spices, perfume oils, leather and textiles in the lanes; a mosque at the centre; and restaurants that fill with locals rather than tour groups.",
      "Bargaining is the norm and it's meant to be good-humoured. Take your time.",
    ],
    images: [media.oldMarket.card],
    duration: "Evening",
    durationHours: 3,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Spice, craft and textile stalls",
      "Local restaurants and coffee houses",
      "The most local corner of Sharm",
      "Private car both ways",
    ],
    included: ["Private return transfer", "Driver waiting time"],
    excluded: [...baseExcluded, "Purchases, food and drinks"],
    itinerary: [
      { title: "Pickup", detail: "Private car from your hotel." },
      { title: "The market", detail: "Time in the lanes to browse, eat and shop." },
      { title: "Return", detail: "Collected at the agreed time." },
    ],
    meetingPoint: "Hotel pickup across Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Prices at the stalls are negotiable — start well below the opening number and keep it friendly.",
    ],
    faq: baseFaq,
    related: ["soho-square", "naama-bay", "farsha-cafe"],
    verified: false,
    featured: false,
    priority: 19,
  },
  {
    title: "Pyramids & the Grand Egyptian Museum",
    slug: "cairo-pyramids-gem",
    destination: "cairo",
    category: "culture",
    type: "group",
    summary:
      "Giza and the Grand Egyptian Museum in one day, run from Sharm El Sheikh by flight or from a Cairo hotel.",
    description: [
      "The Giza plateau and the Grand Egyptian Museum sit within sight of each other, and seeing them on the same day is the right way round: the monuments first, then the objects that came out of them.",
      "From Sharm this runs as a long day by air. If you're already in Cairo, it starts at your hotel.",
    ],
    images: [media.pyramids.hero, media.gem.card, media.sphinx.card],
    duration: "Full day",
    durationHours: 12,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "The Pyramids of Giza and the Great Sphinx",
      "The Grand Egyptian Museum",
      "Egyptologist guide throughout",
      "Runs from Sharm El Sheikh or from Cairo",
    ],
    included: [
      "Air-conditioned transport in Cairo",
      "Egyptologist guide",
      "Entrance fees to the Giza plateau and the museum",
      "Lunch",
    ],
    excluded: [
      ...baseExcluded,
      "Flights, when travelling from Sharm El Sheikh",
      "Entry inside the pyramid chambers (ticketed separately on site)",
    ],
    itinerary: [
      { time: "Early", title: "Departure", detail: "Flight from Sharm, or hotel pickup if you're in Cairo." },
      { title: "The Giza plateau", detail: "The pyramids, the panoramic viewpoint and the Sphinx." },
      { title: "Lunch", detail: "Lunch stop between the plateau and the museum." },
      { title: "Grand Egyptian Museum", detail: "Guided visit through the galleries." },
      { title: "Return", detail: "Back to the airport, or to your Cairo hotel." },
    ],
    meetingPoint:
      "Hotel pickup in Cairo, or airport meeting point for travellers flying from Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "From Sharm this is a very long day. Flight schedules set the timings, so we confirm them per departure date.",
      "Museum opening hours and gallery access can change — we confirm the current position before you travel.",
    ],
    faq: baseFaq,
    related: ["old-cairo", "old-market", "airport-transfer"],
    verified: false,
    featured: true,
    priority: 8,
  },
  {
    title: "Old Cairo & the Historic Quarters",
    slug: "old-cairo",
    destination: "cairo",
    category: "culture",
    type: "private",
    summary:
      "A walking day through the older layers of Cairo — the Coptic quarter, the medieval Islamic streets and the covered bazaar.",
    description: [
      "Cairo is a city of layers, and this day works through several of them on foot: the Coptic quarter with its early churches, the medieval city with its mosques and gates, and the bazaar that has been trading in the same streets for centuries.",
      "Private, so the pace and the emphasis are yours.",
    ],
    images: [media.oldCairo.card],
    duration: "Full day",
    durationHours: 8,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "The Coptic quarter and its early churches",
      "Medieval Islamic Cairo",
      "The covered bazaar",
      "Private guide at your own pace",
    ],
    included: ["Private air-conditioned transport", "Egyptologist guide", "Entrance fees", "Lunch"],
    excluded: baseExcluded,
    itinerary: [
      { title: "Hotel pickup", detail: "Collected from your Cairo hotel." },
      { title: "Coptic Cairo", detail: "Walking visit through the quarter." },
      { title: "Lunch", detail: "Lunch in the old city." },
      { title: "Islamic Cairo and the bazaar", detail: "The medieval streets and time in the bazaar." },
      { title: "Return", detail: "Back to your hotel." },
    ],
    meetingPoint: "Hotel pickup in Cairo.",
    importantInfo: [
      ...baseImportant,
      "There is a lot of walking on uneven ground — comfortable shoes are essential.",
      "Shoulders and knees covered for religious sites; women may want a scarf for mosque visits.",
    ],
    faq: baseFaq,
    related: ["cairo-pyramids-gem", "old-market", "private-transfer"],
    verified: false,
    featured: false,
    priority: 20,
  },

  /* ══════════════════════════ TRANSFERS ══════════════════════════ */
  {
    title: "Airport Transfer",
    slug: "airport-transfer",
    destination: "sharm-el-sheikh",
    category: "private-transfers",
    type: "transfer",
    summary:
      "Private arrival and departure transfers at Sharm El Sheikh International. A named driver in arrivals, a fixed price, and flight tracking so delays don't cost you the car.",
    description: [
      "The first and last hour of a trip sets the tone for both. Our driver waits in arrivals with your name, helps with bags and takes you straight to your hotel at a price agreed before you fly.",
      "We track the flight number you give us, so a delayed landing doesn't mean a missing car.",
    ],
    images: [media.airportTransfer.card],
    duration: "One way or return",
    durationHours: 1,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Named driver waiting in arrivals",
      "Flight tracking on arrival transfers",
      "Fixed price agreed before you travel",
      "Child seats available on request",
    ],
    included: ["Private air-conditioned vehicle", "Driver", "Meet and greet in arrivals", "Bottled water"],
    excluded: [...baseExcluded, "Extended waiting beyond the included window"],
    itinerary: [
      { title: "Arrival", detail: "Driver meets you in arrivals with a Bro Tour name board." },
      { title: "Transfer", detail: "Direct to your hotel in an air-conditioned vehicle." },
      { title: "Departure", detail: "Return pickup timed to your outbound flight." },
    ],
    meetingPoint: "Arrivals hall, Sharm El Sheikh International Airport (SSH).",
    importantInfo: [
      ...baseImportant,
      "Send your flight number and hotel name when booking — both are needed to confirm the transfer.",
      "Priced by vehicle size and hotel zone; tell us your group and luggage count for an exact quote.",
    ],
    faq: baseFaq,
    related: ["private-transfer", "soho-square", "naama-bay"],
    verified: false,
    featured: false,
    priority: 21,
  },
  {
    title: "Private Transfers & Day Cars",
    slug: "private-transfer",
    destination: "sharm-el-sheikh",
    category: "private-transfers",
    type: "transfer",
    summary:
      "A car and driver on your schedule — single journeys across town, restaurant runs, or a vehicle at your disposal for a full day.",
    description: [
      "Sometimes you don't want a tour, you want a car that turns up when you say. We run point-to-point journeys across Sharm and full-day hires with a driver who stays with you.",
      "Fixed prices per journey or per day, agreed up front.",
    ],
    images: [media.transfer.card],
    duration: "Flexible",
    durationHours: null,
    priceFrom: null,
    currency: "USD",
    highlights: [
      "Point-to-point or full-day hire",
      "Air-conditioned vehicles, all group sizes",
      "Fixed price agreed before you travel",
      "English-speaking drivers",
    ],
    included: ["Private air-conditioned vehicle", "Driver", "Fuel and tolls"],
    excluded: [...baseExcluded, "Parking or entry fees at your destinations"],
    itinerary: [
      { title: "Tell us the plan", detail: "Where you want to go and when." },
      { title: "We quote it", detail: "A fixed price per journey or per day." },
      { title: "The car arrives", detail: "Your driver collects you at the agreed time." },
    ],
    meetingPoint: "Any hotel or address in Sharm El Sheikh.",
    importantInfo: [
      ...baseImportant,
      "Quoted on request — group size, vehicle type and distance all affect the price.",
    ],
    faq: baseFaq,
    related: ["airport-transfer", "farsha-cafe", "old-market"],
    verified: false,
    featured: false,
    priority: 22,
  },
];

/* ─────────────────────────── selectors ─────────────────────────── */

export const tourBySlug = (slug: string) => tours.find((t) => t.slug === slug);

export const toursByDestination = (slug: string) =>
  tours.filter((t) => t.destination === slug).sort((a, b) => a.priority - b.priority);

export const toursByCategory = (slug: string) =>
  tours.filter((t) => t.category === slug).sort((a, b) => a.priority - b.priority);

export const featuredTours = () =>
  tours.filter((t) => t.featured).sort((a, b) => a.priority - b.priority);

export function relatedTours(tour: Tour, limit = 3) {
  const curated = tour.related
    .map((slug) => tours.find((t) => t.slug === slug))
    .filter((t): t is Tour => Boolean(t));

  if (curated.length >= limit) return curated.slice(0, limit);

  const fallback = tours.filter(
    (t) =>
      t.slug !== tour.slug &&
      !curated.some((c) => c.slug === t.slug) &&
      (t.category === tour.category || t.destination === tour.destination),
  );

  return [...curated, ...fallback].slice(0, limit);
}

/** Duration buckets used by the tours filter bar. */
export const durationBuckets = [
  { id: "short", label: "Up to 2 hours", test: (h: number | null) => h !== null && h <= 2 },
  { id: "half", label: "Half day", test: (h: number | null) => h !== null && h > 2 && h <= 6 },
  { id: "full", label: "Full day", test: (h: number | null) => h !== null && h > 6 },
] as const;
