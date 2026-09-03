import { STUDIO } from "@/lib/seo";
import { HeroLabel } from "./HeroLabel";

/**
 * Home hero — one full-viewport asset, and four pieces of type over it.
 *
 * Its only job is to make someone keep scrolling, so it carries no statistics,
 * no biography, no counts and no service list. The previous hero had a
 * standfirst paragraph and two buttons doing explanatory work; that belongs to
 * the sections beneath, not here.
 *
 * The corners are: the wordmark top-left, the location tags top-right, the
 * eyebrow and signature line bottom-left, and the scroll cue bottom-centre.
 * Nothing is centred over the middle of the image, so whatever the photograph
 * is doing there stays visible.
 *
 * The signature line is never invented. With no statement saved the hero shows
 * an explicit editorial placeholder that could not be mistaken for finished
 * copy, because a plausible-sounding generated sentence is exactly the thing
 * that ships by accident.
 */
export function HomeHero({
  mediaUrl,
  statement,
  locations,
  credit,
}: {
  mediaUrl?: string | null;
  statement?: string;
  locations?: string[];
  credit?: string;
}) {
  const url = (mediaUrl ?? "").trim();
  // The upload keeps the original extension, so the kind can be read off the
  // URL — one upload field, no "is this a video?" control to get wrong.
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  const line = (statement ?? "").trim();
  const places = (locations ?? []).map((l) => l.trim()).filter(Boolean);
  const creditLine = (credit ?? "").trim();

  return (
    <section
      aria-label="Introduction"
      className="relative mx-[calc(50%-50vw)] flex w-[100vw] flex-col justify-between overflow-hidden"
      // Full viewport less the header, so the hero ends where the fold does
      // and the next section is genuinely below it.
      style={{ minHeight: "calc(100svh - 5.5rem)" }}
    >
      {url ? (
        isVideo ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center border-y border-line bg-surface">
          <p className="label-mono">Hero media not set</p>
        </div>
      )}

      <div className="relative mx-auto flex w-full max-w-6xl items-start justify-between gap-6 px-6 pt-10 sm:px-8">
        {/*
          Fluid rather than stepped: one clamp() covers every width instead of
          jumping at the sm/lg breakpoints, so the wordmark is always in
          proportion to the frame it sits in.

          The sizing mechanics come from the supplied spec — the clamp range,
          the -0.04em tracking and the 0.9 line-height — but the family stays
          the site's serif. Tight negative tracking is a sans-serif convention
          and reads differently on a serif, so this is worth a look rather than
          a nod; the alternative would have been swapping the display face,
          which is off-limits.
        */}
        <p
          className="display-title text-balance"
          style={{
            fontSize: "clamp(34px, 5.2vw, 84px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
          }}
        >
          <HeroLabel>{STUDIO.name}</HeroLabel>
        </p>
        {places.length > 0 ? (
          <p
            className="label-mono mt-2 shrink-0 text-right"
            style={{ fontSize: "clamp(10px, 0.9vw, 13px)" }}
          >
            <HeroLabel>{places.join(" · ")}</HeroLabel>
          </p>
        ) : null}
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-12 sm:px-8 sm:pb-16">
        <p className="label-mono" style={{ fontSize: "clamp(11px, 0.95vw, 14px)" }}>
          <HeroLabel>Architect</HeroLabel>
        </p>
        {line ? (
          <p
            className="display-title mt-4 max-w-3xl"
            style={{
              fontSize: "clamp(23px, 3.1vw, 50px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            <HeroLabel>{line}</HeroLabel>
          </p>
        ) : (
          <p className="mt-4 max-w-xl border border-dashed border-line bg-surface/80 p-4 text-sm text-mute backdrop-blur-sm">
            Add the studio&rsquo;s signature statement under Dashboard → Settings. It should be a
            real line from the architect, not written for her.
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <p className="label-mono" style={{ fontSize: "clamp(10px, 0.9vw, 13px)" }}>
            <HeroLabel>
              Scroll to explore <span aria-hidden>↓</span>
            </HeroLabel>
          </p>
          {/* Attribution, when the image needs one. Small and out of the way,
              but present — a licence that requires credit is not satisfied by
              a note in the codebase. */}
          {creditLine ? (
            <p style={{ fontSize: "clamp(10px, 0.78vw, 12px)" }}>
              <HeroLabel>{creditLine}</HeroLabel>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
