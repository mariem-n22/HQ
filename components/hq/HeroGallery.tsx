"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import { Frame } from "./Frame";

/**
 * Compact paged gallery for the /portfolio hero slot.
 *
 * Deliberately not the full-screen lightbox — this is a small portrait beside
 * the bio, so a full-viewport takeover would be the wrong gesture. The add,
 * reorder and remove mechanics are shared with the project gallery via the
 * same dashboard control; only the presentation differs.
 *
 * With zero images this renders the same `Frame` placeholder as before, so the
 * empty state does not regress.
 */
export function HeroGallery({
  images,
  className = "",
}: {
  images: GalleryImage[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <Frame src={null} alt="Studio image" ratio="3/4" priority className={className} />
    );
  }

  const current = images[Math.min(index, images.length - 1)];
  const step = (delta: number) =>
    setIndex((prev) => (prev + delta + images.length) % images.length);

  return (
    <div className={`relative ${className}`}>
      <Frame
        src={current?.url ?? null}
        alt={current?.alt || current?.caption || "Studio image"}
        ratio="3/4"
        priority
        className="rounded-sm"
      />

      {images.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="pointer-events-auto rounded-sm border border-line bg-base/80 p-1.5 text-mute backdrop-blur-sm transition-colors hover:border-amber hover:text-amber"
            >
              <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
            </button>
            <span className="pointer-events-none rounded-sm bg-base/80 px-2 py-1 font-mono text-[10px] tracking-widest text-mute backdrop-blur-sm">
              {index + 1}/{images.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="pointer-events-auto rounded-sm border border-line bg-base/80 p-1.5 text-mute backdrop-blur-sm transition-colors hover:border-amber hover:text-amber"
            >
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>
          {current?.caption ? (
            <p className="mt-2 text-center text-xs text-mute">{current.caption}</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
