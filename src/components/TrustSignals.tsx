import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/**
 * Trust system.
 *
 * BINDING CONSTRAINT (docs/design-research.md §6): every claim rendered here
 * must be true by construction — a statement about how Bro Tour operates, not
 * a number that would need auditing.
 *
 * Competitors in this segment routinely publish unverifiable counts, ratings
 * and awards. We deliberately do not. When the client supplies verified
 * figures, pass them as `verifiedStats` and they render in the numeric band;
 * leave it empty and that band simply doesn't appear.
 */

export interface TrustClaim {
  title: string;
  body: string;
}

/** Capability claims — factual descriptions of how the operation works. */
export const trustClaims: TrustClaim[] = [
  {
    title: "One local team",
    body: "We're based in Sharm El Sheikh and run our own trips. The person who answers your message is the person arranging your day.",
  },
  {
    title: "Direct, not resold",
    body: "You're booking with the operator, not a marketplace layering a margin on top of someone else's boat.",
  },
  {
    title: "No payment to enquire",
    body: "Send a request and we come back with availability and a final price in writing. Nothing is charged before you agree.",
  },
  {
    title: "Private options throughout",
    body: "Most experiences can run as a private group — your own boat, guide or vehicle — if you'd rather not share the day.",
  },
  {
    title: "Plans that can move",
    body: "Weather turns and dates change. Tell us and we'll rework it rather than hold you to a booking that no longer works.",
  },
  {
    title: "Answers in your language",
    body: "WhatsApp, phone or email, seven days a week, from people who are actually in the destination.",
  },
];

export function TrustSignals({
  claims = trustClaims,
  verifiedStats = [],
  tone = "light",
}: {
  claims?: TrustClaim[];
  /**
   * Only pass figures the client has confirmed. Anything here is presented to
   * travellers as fact.
   */
  verifiedStats?: { value: string; label: string }[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div>
      {verifiedStats.length ? (
        <dl className="mb-16 grid gap-px overflow-hidden border border-current/15 bg-current/15 sm:grid-cols-2 lg:grid-cols-4">
          {verifiedStats.map((stat) => (
            <div key={stat.label} className={cn("p-8", dark ? "bg-ink" : "bg-paper")}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-[2.75rem] leading-none">
                  {stat.value}
                </span>
                <span className="mt-2 block text-[0.75rem] leading-snug opacity-60">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {claims.map((claim, i) => (
          <Reveal as="li" key={claim.title} delay={i * 70}>
            <div
              className={cn(
                "flex h-full flex-col border-t py-7",
                dark ? "border-ink-line" : "border-sand",
              )}
            >
              <span
                className={cn(
                  "font-display text-[1.75rem] leading-none",
                  dark ? "text-sun/60" : "text-sand",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-[1.375rem] leading-tight">
                {claim.title}
              </h3>
              <p
                className={cn(
                  "mt-2.5 text-[0.9375rem] leading-relaxed",
                  dark ? "text-paper/60" : "text-stone",
                )}
              >
                {claim.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
