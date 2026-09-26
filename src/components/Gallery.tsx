"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Editorial gallery with a lightbox.
 *
 * Performance: only the first four tiles are eagerly decoded; the rest are
 * lazy. The lightbox mounts a single full-size <Image> on demand rather than
 * rendering large sources behind the grid.
 */
export function Gallery({
  images,
  columns = 3,
}: {
  images: MediaImage[];
  columns?: 2 | 3 | 4;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, close, go]);

  if (!images.length) return null;

  return (
    <>
      <ul
        className={cn(
          "grid gap-2 md:gap-3",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-2 md:grid-cols-3",
          columns === 4 && "grid-cols-2 md:grid-cols-4",
        )}
      >
        {images.map((image, i) => (
          <li
            key={`${image.src}-${i}`}
            className={cn(
              // A 3-col grid where every 5th tile spans two columns keeps the
              // rhythm from feeling like a contact sheet.
              columns === 3 && i % 5 === 0 && "md:col-span-2 md:row-span-2",
            )}
          >
            <button
              onClick={() => setIndex(i)}
              aria-label={`Open image ${i + 1} of ${images.length}`}
              className="media media-zoom group relative block aspect-[4/3] w-full cursor-zoom-in"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading={i < 4 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
                style={image.position ? { objectPosition: image.position } : undefined}
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </button>
          </li>
        ))}
      </ul>

      {index !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[130] flex flex-col bg-ink/96 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-5 py-4 text-paper md:px-8">
            <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-paper/60">
              {index + 1} / {images.length}
            </span>
            <button
              onClick={close}
              aria-label="Close viewer"
              className="grid size-10 place-items-center rounded-pill border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div className="relative grow">
            <Image
              key={images[index].src}
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="100vw"
              className="rise object-contain p-3 md:p-10"
            />
          </div>

          <div className="flex items-center justify-between gap-6 px-5 py-6 md:px-8">
            <p className="max-w-xl text-xs leading-relaxed text-paper/60">
              {images[index].alt}
            </p>
            <div className="flex shrink-0 gap-2">
              <NavBtn label="Previous image" onClick={() => go(-1)} rotate />
              <NavBtn label="Next image" onClick={() => go(1)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function NavBtn({
  label,
  onClick,
  rotate,
}: {
  label: string;
  onClick: () => void;
  rotate?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-pill border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink"
    >
      <svg
        width="16"
        height="8"
        viewBox="0 0 16 8"
        fill="none"
        aria-hidden
        className={rotate ? "rotate-180" : undefined}
      >
        <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}
