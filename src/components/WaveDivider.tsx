import { cn } from "@/lib/utils";

export type WaveVariant = "wave-1" | "wave-2" | "wave-gentle" | "curve-arc";

interface WaveDividerProps {
  position?: "top" | "bottom";
  variant?: WaveVariant;
  fillColor?: string; // e.g. "text-paper", "text-paper-warm", "text-ink"
  color?: string; // convenient alias for fillColor
  className?: string;
  flipX?: boolean;
  heightClass?: string; // e.g. "h-8 sm:h-12 md:h-16 lg:h-20"
}

/**
 * WaveDivider — Smooth, organic wave dividers for modern curved section transitions.
 * Eliminates rigid rectangular box borders and creates a flowing, oceanic Red Sea aesthetic.
 */
export function WaveDivider({
  position = "bottom",
  variant = "wave-1",
  fillColor,
  color,
  className,
  flipX = false,
  heightClass = "h-8 sm:h-12 md:h-16 lg:h-20",
}: WaveDividerProps) {
  const isTop = position === "top";
  const resolvedColor = fillColor || color || "text-paper";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full overflow-hidden leading-none pointer-events-none select-none z-10",
        isTop ? "-top-px -mt-px" : "-bottom-px -mb-px",
        flipX && "-scale-x-100",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="currentColor"
        preserveAspectRatio="none"
        className={cn("w-full block", resolvedColor, heightClass)}
      >
        {isTop ? (
          // Top divider: path covers the top area [0,0] to [1440,0] down to the wave curve
          variant === "wave-1" ? (
            <path d="M0,0 L1440,0 L1440,32 C1220,72 980,12 720,44 C460,76 220,16 0,36 Z" />
          ) : variant === "wave-2" ? (
            <path d="M0,0 L1440,0 L1440,24 C1260,68 1080,18 840,48 C600,78 360,14 0,38 Z" />
          ) : variant === "curve-arc" ? (
            <path d="M0,0 L1440,0 L1440,16 Q720,80 0,16 Z" />
          ) : (
            // wave-gentle
            <path d="M0,0 L1440,0 L1440,28 C1080,60 720,12 360,48 C180,66 90,32 0,28 Z" />
          )
        ) : (
          // Bottom divider: path covers the bottom area [0,80] to [1440,80] up to the wave curve
          variant === "wave-1" ? (
            <path d="M0,80 L1440,80 L1440,48 C1220,8 980,68 720,36 C460,4 220,64 0,44 Z" />
          ) : variant === "wave-2" ? (
            <path d="M0,80 L1440,80 L1440,56 C1260,12 1080,62 840,32 C600,2 360,66 0,42 Z" />
          ) : variant === "curve-arc" ? (
            <path d="M0,80 L1440,80 L1440,64 Q720,0 0,64 Z" />
          ) : (
            // wave-gentle
            <path d="M0,80 L1440,80 L1440,52 C1080,20 720,68 360,32 C180,14 90,48 0,52 Z" />
          )
        )}
      </svg>
    </div>
  );
}
