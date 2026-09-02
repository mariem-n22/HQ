import { MediaFigure } from "./MediaFigure";
import type { MediaItem } from "@/lib/types";

/**
 * Project hero — full-bleed image, with the type set at reading scale.
 *
 * Composition follows the reference's article header: a row of small info tags
 * *above* the title, the title at a moderate display size rather than
 * poster-scale, and the photographer credit small over the image. The earlier
 * treatment set the title at `text-8xl`, which read as a magazine cover rather
 * than as part of a project record.
 *
 * What the tag row deliberately does not carry: this page already has an
 * Overview block (Location, Year, Type, Status, Area, Client, Collaborators)
 * and a Statement section further down. Repeating the full metadata set here
 * would put the same facts in two places and the same prose in three, so the
 * hero keeps only the two facts that orient a reader immediately — where and
 * when — and leaves the record to the Overview and the argument to the
 * Statement. Typology is not repeated either; it is Overview's "Type".
 *
 * The page body is a `max-w-6xl` column, so the hero breaks out of it with
 * `mx-[calc(50%-50vw)]`: a margin trick rather than fixed positioning, so the
 * element stays in normal flow. `SiteShell` carries `overflow-x-clip` to
 * absorb the difference between `100vw` and the scrollbar-less viewport.
 */
export function ProjectHero({
  title,
  location,
  year,
  item,
  embedSrc,
}: {
  title: string;
  location?: string;
  year?: string;
  item: MediaItem | null;
  embedSrc?: string | null;
}) {
  const tags = [location, year].filter((v): v is string => Boolean(v && v.trim()));
  const hasMedia = Boolean(embedSrc || item);
  // Credit only when the media actually carries one — never fabricated.
  const credit = item?.caption ?? item?.label ?? null;

  const heading = (
    <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-12 sm:px-8 sm:pb-16">
      {tags.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="label-mono border border-ink/30 px-3 py-1.5 text-ink/90 backdrop-blur-sm"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <h1 className="display-title mt-5 max-w-3xl text-4xl leading-[1.06] text-ink sm:text-5xl">
        {title}
      </h1>
    </div>
  );

  if (!hasMedia) {
    return (
      <header className="pt-10 pb-4">
        {tags.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {tags.map((tag) => (
              <li key={tag} className="label-mono border border-line px-3 py-1.5">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <h1 className="display-title mt-5 max-w-3xl text-4xl leading-[1.06] text-ink sm:text-5xl">
          {title}
        </h1>
      </header>
    );
  }

  return (
    <header className="relative mx-[calc(50%-50vw)] w-[100vw]">
      <div className="relative h-[68vh] min-h-[400px] w-full sm:h-[80vh]">
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

        {/* Scrim, not a tint: enough at the foot to hold the type, gone by the
            upper third. Skipped over video, where it would sit on the film. */}
        {!embedSrc ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base via-base/55 to-transparent"
          />
        ) : null}

        {!embedSrc ? <div className="absolute inset-0">{heading}</div> : null}

        {!embedSrc && credit ? (
          <p className="absolute bottom-4 right-4 text-[11px] text-ink/70 sm:bottom-6 sm:right-8">
            {credit}
          </p>
        ) : null}
      </div>

      {/* With a film, the type sits beneath it rather than over it. */}
      {embedSrc ? <div className="pt-10">{heading}</div> : null}
    </header>
  );
}
