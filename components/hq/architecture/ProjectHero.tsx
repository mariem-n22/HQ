import { MediaFigure } from "./MediaFigure";
import type { MediaItem } from "@/lib/types";

/**
 * Project hero — full-bleed, the photograph carrying the whole frame.
 *
 * The page body is a `max-w-6xl` column, so the hero breaks out of it with
 * `mx-[calc(50%-50vw)]`: a margin trick rather than `position: fixed` or a
 * portal, so the element stays in normal flow and nothing below it has to be
 * repositioned. `SiteShell` carries `overflow-x-clip` to absorb the sub-pixel
 * difference between `100vw` and the scrollbar-less viewport, which is the one
 * way this technique can otherwise produce a horizontal scrollbar.
 *
 * Composition follows the direction's rule that the building is the hero and
 * the interface recedes: the image runs to the edges at close to full viewport
 * height, and the type sits low-left over it with a scrim underneath rather
 * than in a band above it. Nothing is centred — a centred title over
 * architecture reads as a poster; anchored low-left reads as a caption to the
 * building, which is what it is.
 *
 * Every element is conditional. A project with no media renders as type on the
 * page ground with no empty frame, and one with no typology simply starts at
 * the title.
 */
export function ProjectHero({
  title,
  typology,
  location,
  year,
  item,
  embedSrc,
}: {
  title: string;
  typology?: string | null;
  location?: string;
  year?: string;
  item: MediaItem | null;
  embedSrc?: string | null;
}) {
  const meta = [location, year].filter(Boolean).join(" · ");
  const hasMedia = Boolean(embedSrc || item);

  const overlay = (
    <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-12 sm:px-8 sm:pb-16">
      {typology ? <p className="label-mono text-amber">{typology}</p> : null}
      <h1 className="display-title mt-4 max-w-4xl text-5xl leading-[1.02] text-ink sm:text-7xl lg:text-8xl">
        {title}
      </h1>
      {meta ? <p className="mt-5 text-[15px] text-ink/90">{meta}</p> : null}
    </div>
  );

  if (!hasMedia) {
    // No photograph: the type stands on its own with room around it rather
    // than sitting against a placeholder frame.
    return (
      <header className="pt-10 pb-4">
        {typology ? <p className="label-mono text-amber">{typology}</p> : null}
        <h1 className="display-title mt-4 max-w-4xl text-5xl leading-[1.02] text-ink sm:text-7xl">
          {title}
        </h1>
        {meta ? <p className="mt-5 text-[15px] text-mute">{meta}</p> : null}
      </header>
    );
  }

  return (
    <header className="relative mx-[calc(50%-50vw)] w-[100vw]">
      <div className="relative h-[72vh] min-h-[420px] w-full sm:h-[86vh]">
        {embedSrc ? (
          <iframe
            src={embedSrc}
            title={`${title} film`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : item ? (
          <MediaFigure
            item={item}
            fallbackRatio="16 / 9"
            priority
            fill
            className="h-full w-full border-0"
            imgClassName="h-full w-full object-cover"
            sizes="100vw"
          />
        ) : null}

        {/*
          Scrim, not a tint: opaque enough at the foot to hold the title, gone
          by the upper third so the building is never veiled. Skipped over a
          video, where a permanent overlay would sit on top of the footage.
        */}
        {!embedSrc ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base via-base/55 to-transparent"
          />
        ) : null}

        {!embedSrc ? <div className="absolute inset-0">{overlay}</div> : null}
      </div>

      {/* With a film, the type sits beneath it rather than over it. */}
      {embedSrc ? <div className="pt-10">{overlay}</div> : null}
    </header>
  );
}
