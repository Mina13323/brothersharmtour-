import type { FaqItem, Testimonial } from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER REVIEW DATA
 *
 * Bro Tour has not supplied real review content, and inventing customer
 * testimonials would be dishonest. Every record below is flagged
 * `placeholder: true` and exists only to prove out the component's data shape,
 * character counts and layout behaviour.
 *
 * Replace with verified reviews (TripAdvisor / Google / GetYourGuide exports or
 * a CMS collection) before launch. The UI reads `placeholder` and renders a
 * small notice so nothing untrue is presented to a visitor as fact.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Sample review text reserved for a verified traveller quote. Roughly this length reads best in the carousel — two or three sentences covering what the trip was and what made it worth doing.",
    author: "Traveller name",
    origin: "Country",
    tourSlug: "white-island",
    rating: 5,
    placeholder: true,
  },
  {
    quote:
      "A second slot for a verified review, ideally about a desert experience so the carousel covers more than one side of what Bro Tour runs.",
    author: "Traveller name",
    origin: "Country",
    tourSlug: "super-safari",
    rating: 5,
    placeholder: true,
  },
  {
    quote:
      "A third slot, reserved for a family or transfer review — the logistics side of the business deserves representation alongside the excursions.",
    author: "Traveller name",
    origin: "Country",
    tourSlug: "airport-transfer",
    rating: 5,
    placeholder: true,
  },
];

export const hasRealTestimonials = testimonials.some((t) => !t.placeholder);

/** General FAQ — booking, payment and logistics. */
export const generalFaq: FaqItem[] = [
  {
    question: "How do I book with Bro Tour?",
    answer:
      "Send a request through any Book Now button or message us on WhatsApp. Tell us the experience, your date and how many people are travelling. We reply with availability, your hotel's pickup time and a final price. Nothing is charged until you confirm.",
  },
  {
    question: "Do you pick up from my hotel?",
    answer:
      "Yes. Hotel pickup and drop-off is included on almost everything we run, across Naama Bay, Nabq, Sharks Bay, Hadaba, Old Market and the surrounding zones. Pickup times shift slightly by zone and we confirm yours the evening before.",
  },
  {
    question: "How and when do I pay?",
    answer:
      "Most trips are settled in cash on the day, in USD, EUR, GBP or EGP. For larger group bookings or trips that need tickets bought in advance, we'll agree a deposit when you book.",
  },
  {
    question: "What if the weather stops a trip running?",
    answer:
      "Sea trips depend on conditions and the coastguard's decision on the day. If a trip can't run safely we move you to another date or refund you in full. We don't run trips in marginal conditions.",
  },
  {
    question: "Can you arrange private versions of your tours?",
    answer:
      "Most of them, yes. A private trip means your group only, your pace and usually a flexible start time. Tell us your group size and date and we'll quote it alongside the shared option.",
  },
  {
    question: "Do you cater to families with young children?",
    answer:
      "Yes, and some experiences suit them better than others. The glass-bottom boat, the semi-submarine and the dolphin show all work well with small children. Tell us your children's ages when you enquire and we'll steer you.",
  },
  {
    question: "Which languages do your guides speak?",
    answer:
      "English on all our trips. Other languages can often be arranged with notice — ask when you enquire.",
  },
  {
    question: "Can you organise Cairo from Sharm El Sheikh?",
    answer:
      "Yes. The Pyramids and Grand Egyptian Museum day runs from Sharm by air. It is a long day and the timings follow the flight schedule, so we confirm those per departure date.",
  },
];
