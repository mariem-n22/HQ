"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/types";
import { ratioOf } from "@/lib/types";

/**
 * A single image or video, laid out from its own intrinsic dimensions.
 *
 * This is the replacement for `Frame` on architecture surfaces. `Frame` takes
 * a hardcoded `ratio` and `object-cover`s everything into it, which was fine
 * for a software portfolio of screenshots and is actively wrong here: a wide
 * panoramic exterior and a tall stairwell shot would both be cropped into the
 * same 4/3 box. Architectural photography is frequently wide, and drawings are
 * whatever shape the sheet is.
 *
 * So the ratio comes from the stored width/height when we have them, and
 * `fallbackRatio` is used only when we do not — never a blind crop. `fit`
 * stays "contain" for drawings and diagrams, where cropping destroys the
 * content, and "cover" is opt-in for the places a bleed is wanted.
 *
 * Declaring the box up front also satisfies the CLS rule: the space is
 * reserved before the asset loads, so nothing below it jumps.
 */
export function MediaFigure({
  item,
  fallbackRatio = "4 / 3",
  fit = "cover",
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  item: MediaItem;
  fallbackRatio?: string;
  fit?: "cover" | "contain";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ratio = ratioOf(item) ?? fallbackRatio;
  const objectFit = fit === "contain" ? "object-contain" : "object-cover";

  if (item.kind === "VIDEO") {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`} style={{ aspectRatio: ratio }}>
        <video
          src={item.url}
          poster={undefined}
          muted
          loop
          playsInline
          autoPlay
          // A silent, looping architectural clip is decoration around the
          // building, not media the visitor came to operate — but controls
          // stay reachable for anyone who wants to pause it.
          controls
          preload="metadata"
          aria-label={item.alt ?? item.caption ?? "Project video"}
          className={`h-full w-full ${objectFit} ${imgClassName}`}
        />
      </div>
    );
  }

  if (!item.url || failed) {
    return (
      <div
        className={`flex items-center justify-center border border-line bg-surface ${className}`}
        style={{ aspectRatio: ratio }}
      >
        <span className="label-mono">No image yet</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`} style={{ aspectRatio: ratio }}>
      <img
        src={item.url}
        alt={item.alt ?? item.caption ?? item.label ?? ""}
        width={item.width}
        height={item.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full ${objectFit} ${imgClassName}`}
      />
    </div>
  );
}
