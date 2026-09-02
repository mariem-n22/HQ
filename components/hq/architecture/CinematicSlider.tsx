"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CarouselArrow } from "./CarouselArrow";

/**
 * Horizontal carousel matching the reference's mechanics.
 *
 * Structure mirrors the captured markup: an overflow-hidden canvas holding a
 * single wrapper that lays every slide out side by side with a 5px gap, panned
 * with `transform: translateX(...)`. Each slide is narrower than the canvas, so
 * the neighbouring slides are cropped at the canvas edges — that peek is the
 * point, and it is what a per-slide crossfade cannot produce: the eye sees the
 * set continue rather than one framed picture replacing another.
 *
 *   canvas   |----------------------------|
 *   wrapper  -| 02 |-|   03   |-| 04 |-----   <- translateX moves the strip
 *
 * One deliberate deviation from the capture, flagged rather than hidden. The
 * reference's `translateX(-2338.17px)` with a 774.391px item and 5px gap is
 * exactly `index x (width + gap)` at index 3, which pins the active slide to
 * the canvas's left edge — so only the *next* slide peeks and every previous
 * one sits off-canvas. The brief asks for both neighbours to be visible, so the
 * active slide is centred instead: `-(index x step) + (canvas - item) / 2`.
 * The mechanic is identical; only the resting offset differs. Set
 * `CENTRE_ACTIVE` to false for the reference's exact left-aligned behaviour.
 *
 * Unchanged from the previous implementation, which was already correct:
 * controls fade out at the first/last slide over 0.8s ease-in-out, pagination
 * numbers separate active from inactive by opacity alone (1 against 0.5) with
 * `aria-current` carrying the state for anyone who cannot perceive that, and
 * `prefers-reduced-motion` drops the animation entirely.
 */

const DURATION = 800; // ms — the reference's 0.8s
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const GAP = 5; // px, as captured
const CENTRE_ACTIVE = true;

/** Slide width as a fraction of the canvas. The remainder is the peek. */
const ITEM_RATIO = { base: 0.86, sm: 0.72, lg: 0.66 };

export function CinematicSlider({
  count,
  label,
  renderItem,
  creditFor,
  ratio = "16 / 9",
}: {
  count: number;
  label: string;
  renderItem: (index: number) => ReactNode;
  creditFor?: (index: number) => string | null;
  ratio?: string;
}) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [metrics, setMetrics] = useState({ canvas: 0, item: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Slide width is computed rather than declared in CSS, because the pan
  // offset is a pixel translate and has to agree with it exactly.
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const measure = () => {
      const canvas = node.clientWidth;
      const r = canvas >= 1024 ? ITEM_RATIO.lg : canvas >= 640 ? ITEM_RATIO.sm : ITEM_RATIO.base;
      setMetrics({ canvas, item: Math.round(canvas * r) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const go = useCallback(
    (next: number) => setActive(Math.min(count - 1, Math.max(0, next))),
    [count],
  );

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

  const step = metrics.item + GAP;
  const centring = CENTRE_ACTIVE ? (metrics.canvas - metrics.item) / 2 : 0;
  // Clamped so the strip never pulls away from its own ends and leaves a gap.
  const raw = -(active * step) + centring;
  const min = -(step * (count - 1)) + centring;
  const offset = count === 1 ? centring : Math.max(min, Math.min(centring, raw));

  const atStart = active === 0;
  const atEnd = active === count - 1;
  const credit = creditFor?.(active) ?? null;

  const control = (side: "prev" | "next", hidden: boolean) => (
    <button
      type="button"
      onClick={() => go(side === "prev" ? active - 1 : active + 1)}
      aria-label={`${side === "prev" ? "Previous" : "Next"} ${label} image`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-ink/50 bg-base/10 text-ink backdrop-blur-sm hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:h-14 sm:w-14 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transition: reduced ? "none" : `all ${DURATION}ms ease-in-out` }}
    >
      {/* Roughly 40% of the control's diameter — the proportion the glyph
          occupies in the reference, rather than its literal pixel size. */}
      <CarouselArrow direction={side} className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );

  return (
    <section aria-roledescription="carousel" aria-label={label}>
      <div
        ref={stageRef}
        tabIndex={0}
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
        className="relative focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
      >
        <div ref={canvasRef} className="overflow-hidden" style={{ aspectRatio: ratio }}>
          <div
            className="flex h-full"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(${offset}px)`,
              transition: reduced ? "none" : `transform ${DURATION}ms ${EASE}`,
            }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                // Off-stage slides stay visible — that is the peek — but are
                // taken out of the tab order so focus never lands on a
                // half-cropped item.
                inert={i !== active}
                className="h-full shrink-0 overflow-hidden border border-line bg-surface"
                style={{
                  width: metrics.item ? `${metrics.item}px` : "100%",
                  // Neighbours sit back a little so the active slide reads as
                  // the subject rather than one of three equal pictures.
                  opacity: reduced || i === active ? 1 : 0.55,
                  transition: reduced ? "none" : `opacity ${DURATION}ms ${EASE}`,
                }}
              >
                {renderItem(i)}
              </div>
            ))}
          </div>
        </div>

        {/*
          Controls span the active slide's width, not the canvas — as in the
          reference, where `.carousel-control-wrapper` is set to the item
          width. The next arrow therefore sits exactly where the following
          slide begins to show.
        */}
        <div
          className="pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-between"
          style={{
            left: metrics.item ? `${centring}px` : 0,
            width: metrics.item ? `${metrics.item}px` : "100%",
            paddingInline: "1rem",
          }}
        >
          {control("prev", atStart)}
          {control("next", atEnd)}
        </div>
      </div>

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
