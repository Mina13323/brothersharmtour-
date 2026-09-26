"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MediaImage, MediaVideo } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Cinematic hero.
 *
 * The poster image always renders first and is the LCP element. The video is
 * only attached on fine-pointer devices, after the image has painted, and is
 * skipped entirely for reduced-motion users and coarse pointers — so mobile
 * gets a sharp still instead of a metered download.
 */
export function Hero({
  image,
  video,
  eyebrow,
  title,
  subtitle,
  children,
  size = "full",
  align = "start",
}: {
  image: MediaImage;
  video?: MediaVideo;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  size?: "full" | "tall" | "short";
  align?: "start" | "center";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [attachVideo, setAttachVideo] = useState(false);

  useEffect(() => {
    if (!video) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    if (!fine || reduced || saveData) return;

    // Wait for first paint + idle so the hero image is never delayed by video.
    const schedule =
      window.requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 600));
    const id = schedule(() => setAttachVideo(true));
    return () => {
      if (window.cancelIdleCallback && typeof id === "number") {
        window.cancelIdleCallback(id);
      }
    };
  }, [video]);

  return (
    <section
      className={cn(
        "relative isolate flex w-full overflow-hidden bg-ink text-white",
        size === "full" && "min-h-[100svh]",
        size === "tall" && "min-h-[76svh] md:min-h-[82svh]",
        size === "short" && "min-h-[58svh] md:min-h-[62svh]",
        align === "center" ? "items-center" : "items-end",
      )}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className={cn(
            "slow-zoom object-cover transition-opacity duration-[1400ms]",
            videoReady ? "opacity-0" : "opacity-100",
          )}
          style={image.position ? { objectPosition: image.position } : undefined}
        />

        {video && attachVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={image.src}
            onPlaying={() => setVideoReady(true)}
            aria-hidden
            className={cn(
              "size-full object-cover transition-opacity duration-[1400ms]",
              videoReady ? "opacity-100" : "opacity-0",
            )}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <div className="scrim-hero absolute inset-0 -z-10" />

      <div className="shell relative w-full pb-16 pt-32 md:pb-20 md:pt-40">
        <div
          className={cn(
            "flex max-w-4xl flex-col",
            align === "center" && "mx-auto items-center text-center",
          )}
        >
          {eyebrow ? (
            <p
              className="eyebrow rise text-sun"
              style={{ animationDelay: "120ms" }}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1
            className="display rise mt-5 text-white"
            style={{ animationDelay: "220ms" }}
          >
            {title}
          </h1>

          {subtitle ? (
            <p
              className="rise mt-6 max-w-xl text-[1rem] leading-relaxed text-white/80 md:text-[1.1875rem]"
              style={{ animationDelay: "340ms" }}
            >
              {subtitle}
            </p>
          ) : null}

          {children ? (
            <div
              className={cn(
                "rise mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center",
                align === "center" && "justify-center",
              )}
              style={{ animationDelay: "460ms" }}
            >
              {children}
            </div>
          ) : null}
        </div>
      </div>

      {size === "full" ? <ScrollCue /> : null}
    </section>
  );
}

function ScrollCue() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
    >
      <span className="text-[0.5625rem] uppercase tracking-[0.3em] text-white/55">
        Scroll
      </span>
      <span className="relative block h-12 w-px overflow-hidden bg-white/25">
        <span className="absolute inset-x-0 top-0 h-4 animate-[cue_2.4s_var(--ease-editorial)_infinite] bg-white/80" />
      </span>
      <style>{`@keyframes cue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(300%)}}`}</style>
    </div>
  );
}
