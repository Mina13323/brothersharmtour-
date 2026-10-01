import { cn } from "@/lib/utils";

/**
 * BROTHER SHARM TOUR wordmark — an original lockup.
 *
 * The mark is a sun sitting on three horizon rules: the Red Sea, the desert
 * and the delta. It reads at 20px in the header and scales cleanly for
 * favicons and OpenGraph without a raster asset.
 */
export function Logo({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 transition-colors duration-500",
        tone === "light" ? "text-white" : "text-ink",
        className,
      )}
    >
      <Glyph className="size-5 sm:size-6 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap text-[0.72rem] xs:text-[0.8rem] sm:text-[0.9375rem] font-bold uppercase leading-none tracking-[0.06em] sm:tracking-[0.16em]">
          Brother Sharm Tour
        </span>
        <span
          className={cn(
            "mt-[2px] text-[0.38rem] sm:text-[0.48rem] uppercase leading-none tracking-[0.16em] sm:tracking-[0.3em]",
            tone === "light" ? "text-white/65" : "text-stone",
          )}
        >
          Egypt · Since 2009
        </span>
      </span>
    </span>
  );
}

export function Glyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={cn("size-7 shrink-0", className)}
      fill="none"
      aria-hidden
    >
      <circle cx="14" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2 19.5h24M5 23h18M9 26.5h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M8 11h12" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
