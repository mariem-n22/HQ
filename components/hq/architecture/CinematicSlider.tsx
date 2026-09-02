"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Full-bleed cinematic slider.
 *
 * Modelled on the Zaha Hadid Architects project-page carousel, with the
 * behaviour taken from the live page rather than from a screenshot:
 *
 *   - circular controls, `rgba(0,0,0,0.1)` over a `1px rgba(255,255,255,0.5)`
 *     hairline, transitioning at 0.8s ease-in-out
 *   - controls fade out entirely at each end of the set rather than sitting
 *     there disabled
 *   - a numbered index row where the active number is distinguished by
 *     opacity alone — 1 against 0.5 — at the same weight and colour, and each
 *     number is its own click target
 *   - the credit line sits beneath the image as plain text
 *
 * This supersedes the earlier boxed multi-slide strip on every gallery: one
 * image at a time, filling its frame, with the neighbours out of view rather
 * than dimmed at the edges.
 *
 * Motion is a crossfade plus a small parallel drift, so a change of slide
 * reads as a cut in a film rather than a strip being dragged. Under
 * `prefers-reduced-motion` the drift and the fade are dropped and slides swap
 * instantly, which is the established behaviour for the sliders here.
 */

const DURATION = 800; // ms — matches the reference's 0.8s
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)"; // ease-in-out

export function CinematicSlider({
  count,
  label,
  renderItem,
  creditFor,
  ratio = "16 / 9",
}: {
  count: number;
  /** Accessible name for the region, e.g. "Site" or "Plans". */
  label: string;
  renderItem: (index: number) => ReactNode;
  /** Credit/caption for a slide. Return null and nothing is rendered. */
  creditFor?: (index: number) => string | null;
  /** Aspect ratio of the stage. */
  ratio?: string;
}) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [hovering, setHovering] = useState(false);
  const touchX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback(
    (next: number) => setActive(Math.min(count - 1, Math.max(0, next))),
    [count],
  );

  // Bound natively so the handler is independent of React's delegated events.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, () => void> = {
        ArrowRight: () => go(active + 1),
        ArrowLeft: () => go(active - 1),
        Home: () => go(0),
        End: () => go(count - 1),
      };
      const run = map[e.key];
      if (!run) return;
      e.preventDefault();
      run();
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [active, count, go]);

  if (count === 0) return null;

  const atStart = active === 0;
  const atEnd = active === count - 1;
  const credit = creditFor?.(active) ?? null;

  /*
   * Controls hide at the ends, as on the reference. `pointer-events-none`
   * rather than `disabled`, so a hidden control is not a focus stop that
   * announces itself to a keyboard user as a dead button.
   */
  const control = (side: "prev" | "next", hidden: boolean) => (
    <button
      type="button"
      onClick={() => go(side === "prev" ? active - 1 : active + 1)}
      aria-label={`${side === "prev" ? "Previous" : "Next"} ${label} image`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/50 bg-base/10 text-ink backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:h-14 sm:w-14 ${
        side === "prev" ? "left-4 sm:left-8" : "right-4 sm:right-8"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"} ${
        // On a pointer device the controls only surface on hover/focus, which
        // is what keeps the photograph uninterrupted. Touch has no hover, so
        // there they are always present.
        !hidden && !hovering ? "sm:opacity-0 sm:group-focus-within:opacity-100" : ""
      } hover:border-amber hover:text-amber`}
      style={{ transition: reduced ? "none" : `all ${DURATION}ms ease-in-out` }}
    >
      {side === "prev" ? (
        <ChevronLeft aria-hidden className="h-5 w-5" />
      ) : (
        <ChevronRight aria-hidden className="h-5 w-5" />
      )}
    </button>
  );

  return (
    <section aria-roledescription="carousel" aria-label={label}>
      <div
        ref={stageRef}
        tabIndex={0}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX ?? null;
          if (start !== null && end !== null && Math.abs(end - start) > 48) {
            go(end < start ? active + 1 : active - 1);
          }
          touchX.current = null;
        }}
        className="group relative w-full overflow-hidden border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
        style={{ aspectRatio: ratio }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!isActive}
              // Inert while off-stage, so a keyboard user cannot tab into a
              // slide that is not visible.
              inert={!isActive}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transform: reduced ? "none" : `scale(${isActive ? 1 : 1.03})`,
                transition: reduced
                  ? "none"
                  : `opacity ${DURATION}ms ${EASE}, transform ${DURATION * 1.6}ms ${EASE}`,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {renderItem(i)}
            </div>
          );
        })}

        {control("prev", atStart)}
        {control("next", atEnd)}
      </div>

      {/* Credit beneath the image, as plain text — only when data exists. */}
      {credit ? <p className="mt-3 text-xs leading-relaxed text-mute">{credit}</p> : null}

      {count > 1 ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {Array.from({ length: count }).map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to ${label} image ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                /*
                 * Opacity alone separates active from inactive — 1 against
                 * 0.5, same weight, same colour — which is what the reference
                 * does. `aria-current` carries the state for anyone who cannot
                 * perceive the opacity difference, so it is never colour or
                 * contrast alone doing the work.
                 */
                className="data-mono min-h-[44px] text-[13px] tracking-widest text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                style={{
                  opacity: isActive ? 1 : 0.5,
                  transition: reduced ? "none" : `opacity ${DURATION}ms ease-in-out`,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            );
          })}
          <span className="sr-only" aria-live="polite">
            {`${active + 1} of ${count}`}
          </span>
        </div>
      ) : null}
    </section>
  );
}
