"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Full-width photo carousel with a "1 / N" counter — the interaction pattern
 * from the sharmtours.org tour pages. Arrows, keyboard support, a thumbnail
 * strip and a click-to-zoom fullscreen view. Degrades to a single image when a
 * tour only has one photo.
 */
export function GalleryCarousel({ images }: { images: MediaImage[] }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const count = images.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setZoom(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (!zoom) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [zoom]);

  if (!count) return null;
  const current = images[index];

  return (
    <div>
      {/* Stage */}
      <div className="media relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-card sm:rounded-3xl md:aspect-[16/9]">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="cursor-zoom-in object-cover transition-opacity duration-300"
          style={current.position ? { objectPosition: current.position } : undefined}
          onClick={() => setZoom(true)}
          priority={index === 0}
        />

        {/* 1 / N counter */}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-pill bg-ink/70 px-3 py-1 text-[0.75rem] font-medium tabular-nums text-white backdrop-blur-sm">
          {index + 1} / {count}
        </span>

        {count > 1 ? (
          <>
            <Arrow side="left" onClick={() => go(-1)} />
            <Arrow side="right" onClick={() => go(1)} />
          </>
        ) : null}
      </div>

      {/* Thumbnails */}
      {count > 1 ? (
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "media relative block size-16 overflow-hidden rounded-xl transition-opacity md:size-20",
                  i === index
                    ? "ring-2 ring-reef-deep ring-offset-2 ring-offset-paper"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Fullscreen zoom */}
      {zoom ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal
          aria-label="Photo viewer"
        >
          <span className="absolute left-4 top-4 rounded-pill bg-white/10 px-3 py-1 text-[0.8rem] font-medium tabular-nums text-white">
            {index + 1} / {count}
          </span>
          <button
            onClick={() => setZoom(false)}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div
            className="relative h-[80vh] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 ? (
              <>
                <Arrow side="left" onClick={() => go(-1)} light />
                <Arrow side="right" onClick={() => go(1)} light />
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Arrow({
  side,
  onClick,
  light = false,
}: {
  side: "left" | "right";
  onClick: () => void;
  light?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full backdrop-blur-sm transition-colors md:size-11",
        side === "left" ? "left-3" : "right-3",
        light
          ? "border border-white/25 bg-white/10 text-white hover:bg-white/20"
          : "bg-ink/60 text-white hover:bg-ink/85",
      )}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
