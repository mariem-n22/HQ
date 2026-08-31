"use client";

import Link from "next/link";
import type { MediaItem } from "@/lib/types";
import { STATUS_LABELS, TYPOLOGY_LABELS } from "@/lib/types";
import { MediaFigure } from "./MediaFigure";

export type ArchiveEntry = {
  id: string;
  slug: string;
  title: string;
  location: string;
  year: string;
  status: string;
  typology: string | null;
  cover: MediaItem | null;
};

/**
 * Archive card. The photograph is the content; everything else is caption.
 *
 * Hover is a slow pan-and-scale on the image with the metadata fading up over
 * it — deliberately not a hard zoom. Both are `transform`/`opacity` only, so
 * the motion cannot reflow the grid.
 *
 * The metadata is capped at three lines (location · year, typology, status)
 * and there are no tech-stack chips: this is a building, not a repository.
 */
export function ArchiveCard({ entry, priority = false }: { entry: ArchiveEntry; priority?: boolean }) {
  const cover: MediaItem = entry.cover ?? { url: "", kind: "IMAGE" };
  const meta = [entry.location, entry.year].filter(Boolean).join(" · ");
  const typology = entry.typology ? TYPOLOGY_LABELS[entry.typology] ?? entry.typology : "";
  const status = STATUS_LABELS[entry.status] ?? entry.status;

  return (
    <Link
      href={`/work/${entry.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
    >
      <div className="relative overflow-hidden border border-line">
        <MediaFigure
          item={cover}
          fallbackRatio="4 / 3"
          priority={priority}
          className="border-0"
          imgClassName="transition-transform duration-[1200ms] ease-out will-change-transform group-hover:scale-[1.04] group-hover:-translate-x-[0.6%] motion-reduce:transform-none motion-reduce:transition-none"
        />
        {/*
          Metadata veil. Hidden until hover on pointer devices; on touch, where
          there is no hover, it is always visible so the card is never mute.
        */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-base/85 via-base/40 to-transparent p-4 opacity-100 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          {typology ? <p className="label-mono text-amber">{typology}</p> : null}
          {meta ? <p className="mt-1 text-[13px] text-ink">{meta}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className="display-title text-2xl text-ink transition-colors group-hover:text-amber">
          {entry.title}
        </h3>
        <span className="label-mono shrink-0">{status}</span>
      </div>
    </Link>
  );
}
