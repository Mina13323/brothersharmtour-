"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MediaImage, MediaVideo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { WaveDivider } from "./WaveDivider";

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
  showWave = true,
  waveColor = "text-paper",
  variant = "bleed",
  cta,
  trustBadge,
}: {
  image: MediaImage;
  video?: MediaVideo;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  size?: "full" | "tall" | "short";
  align?: "start" | "center";
  showWave?: boolean;
  waveColor?: string;
  variant?: "bleed" | "card";
  cta?: { label: string; href: string };
  trustBadge?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [attachVideo, setAttachVideo] = useState(false);

  useEffect(() => {
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    if (reduced || saveData) return;

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

  // Framed card variant matching the modern reference
  if (variant === "card") {
    return (
      <section className="relative w-full bg-paper pt-3 sm:pt-4 md:pt-6 px-3 sm:px-5 lg:px-8">
        <div className="relative isolate w-full max-w-[1520px] mx-auto rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden bg-ink text-white shadow-2xl min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] flex flex-col justify-between border border-white/10">
          {/* Media background */}
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

          {/* Scrim overlay removed as requested */}

          {/* Hero Content */}
          <div className="shell relative w-full pt-28 sm:pt-36 lg:pt-44 pb-20 sm:pb-28 lg:pb-32">
            <div className="flex max-w-3xl flex-col items-start text-left">
              {eyebrow ? (
                <div
                  className="rise inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white border border-white/20 mb-5"
                  style={{ animationDelay: "120ms" }}
                >
                  <span className="size-1.5 rounded-full bg-reef-bright animate-pulse" />
                  {eyebrow}
                </div>
              ) : null}

              <h1
                className="font-display rise text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-white leading-[1.06] drop-shadow-md"
                style={{ animationDelay: "220ms" }}
              >
                {title}
              </h1>

              {subtitle ? (
                <p
                  className="rise mt-5 max-w-xl text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed font-normal drop-shadow-sm"
                  style={{ animationDelay: "340ms" }}
                >
                  {subtitle}
                </p>
              ) : null}

              {cta || trustBadge ? (
                <div
                  className="rise mt-8 flex flex-wrap items-center gap-4"
                  style={{ animationDelay: "460ms" }}
                >
                  {cta ? (
                    <a
                      href={cta.href}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-sun hover:bg-sun-bright text-white px-7 py-3.5 text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <span>{cta.label}</span>
                      <span aria-hidden="true" className="text-base transition-transform group-hover:translate-x-1">→</span>
                    </a>
                  ) : null}

                  {trustBadge}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Floating docked search bar */}
        {children ? (
          <div id="search-bar" className="relative z-30 -mt-10 sm:-mt-12 lg:-mt-14 max-w-5xl mx-auto px-4">
            {children}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "on-ink relative isolate flex w-full overflow-hidden bg-ink text-white",
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

      {showWave && (
        <WaveDivider
          position="bottom"
          fillColor={waveColor}
          variant="wave-1"
          className="z-20"
        />
      )}
    </section>
  );
}

function ScrollCue() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-12 md:bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 z-30 md:flex"
    >
      <span className="text-[0.5625rem] uppercase tracking-[0.3em] text-white/70 font-medium">
        Scroll
      </span>
      <span className="relative block h-10 w-px overflow-hidden bg-white/30 rounded-full">
        <span className="absolute inset-x-0 top-0 h-3.5 animate-[cue_2.4s_var(--ease-editorial)_infinite] bg-white rounded-full" />
      </span>
      <style>{`@keyframes cue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(300%)}}`}</style>
    </div>
  );
}
