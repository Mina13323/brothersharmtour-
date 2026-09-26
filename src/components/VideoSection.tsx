"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaVideo } from "@/lib/types";
import { videoAvailable } from "@/lib/media";
import { Reveal } from "./Reveal";

/**
 * Cinematic film section.
 *
 * Performance rules baked in:
 * - `preload="none"` and no <source> until the section is near the viewport,
 *   so the video bytes are never fetched on a visit that never scrolls here.
 * - Coarse pointers (phones/tablets) keep the poster image and only load the
 *   file on an explicit tap — no autoplay data cost on mobile networks.
 * - The poster is a real, sized <Image>, so it's the LCP candidate and there
 *   is no layout shift when the video swaps in.
 */
export function VideoSection({
  video,
  eyebrow = "Film",
  title,
  text,
}: {
  video: MediaVideo;
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  /* Load the file only when the section is close to the viewport, and only on
     devices where autoplay is appropriate. */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !videoAvailable) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Pause when scrolled away — never keep a decoder running off-screen. */
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const el = videoRef.current;
        if (!el) return;
        if (entry.isIntersecting) {
          el.play().then(() => setPlaying(true)).catch(() => undefined);
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  function togglePlay() {
    if (!videoAvailable) return;
    const el = videoRef.current;
    if (!shouldLoad) {
      setShouldLoad(true);
      return;
    }
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => undefined);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <section className="on-ink bg-ink text-paper">
      <div className="shell band">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="eyebrow text-sun">{eyebrow}</p>
          <h2 className="headline mt-4">{title}</h2>
          {text ? <p className="lede mt-5">{text}</p> : null}
        </Reveal>

        <Reveal delay={90}>
          <div
            ref={containerRef}
            className="media relative aspect-[4/5] w-full sm:aspect-[16/9]"
          >
            <Image
              src={video.poster.src}
              alt={video.poster.alt}
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              className={`object-cover transition-opacity duration-1000 ${
                playing ? "opacity-0" : "opacity-100"
              }`}
            />

            {shouldLoad && videoAvailable ? (
              <video
                ref={videoRef}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
                  playing ? "opacity-100" : "opacity-0"
                }`}
                playsInline
                loop
                muted={muted}
                preload="metadata"
                poster={video.poster.src}
                aria-label={video.label}
              >
                <source src={video.src} type="video/mp4" />
              </video>
            ) : null}

            {/* Controls — hidden until the film files ship, so the poster
                reads as a deliberate full-bleed still rather than a dead
                play button. See `videoAvailable` in src/lib/media.ts. */}
            {videoAvailable ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause film" : "Play film"}
                className="group grid size-[4.5rem] place-items-center rounded-pill border border-white/45 bg-ink/25 text-white backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-white hover:bg-white hover:text-ink md:size-24"
              >
                {playing ? (
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
                    <rect width="5" height="18" rx="1" />
                    <rect x="11" width="5" height="18" rx="1" />
                  </svg>
                ) : (
                  <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor" aria-hidden className="ml-1">
                    <path d="M0 1.7v16.6a1 1 0 0 0 1.53.85l13.3-8.3a1 1 0 0 0 0-1.7L1.53.85A1 1 0 0 0 0 1.7Z" />
                  </svg>
                )}
              </button>
            </div>
            ) : null}

            {shouldLoad ? (
              <button
                onClick={() => {
                  const el = videoRef.current;
                  if (!el) return;
                  el.muted = !el.muted;
                  setMuted(el.muted);
                }}
                aria-label={muted ? "Unmute film" : "Mute film"}
                className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-pill border border-white/40 bg-ink/35 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-ink md:bottom-6 md:right-6"
              >
                {muted ? (
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                    <path d="M1 5v4h2.5L7 12V2L3.5 5H1Z" />
                    <path d="M10.5 5.5 15 10M15 5.5 10.5 10" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                    <path d="M1 5v4h2.5L7 12V2L3.5 5H1Z" />
                    <path d="M10 4.5a3.5 3.5 0 0 1 0 5M12.4 2.4a6.5 6.5 0 0 1 0 9.2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            ) : null}

            <p className="absolute left-4 top-4 text-[0.625rem] uppercase tracking-[0.2em] text-white/70 md:left-6 md:top-6">
              {video.label}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
