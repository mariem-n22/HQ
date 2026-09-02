"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal inertial slider.
 *
 * Built on a native `overflow-x` scroller rather than a transform-driven
 * carousel, deliberately. Touch then gets the platform's own momentum curve —
 * which is better than anything reimplemented here, and is what makes the
 * motion feel right rather than merely animated — plus real scroll semantics,
 * keyboard support and a scrollbar the OS can style. On top of that sit the
 * pieces the native scroller does not give you: pointer drag with a momentum
 * tail for mouse users, an active-slide readout, and centre-weighted emphasis.
 *
 * Motion rules applied: deceleration on arrival, interruptible (any new
 * pointer press or key kills the in-flight momentum), and fully disabled under
 * `prefers-reduced-motion`, where it degrades to plain instant scrolling with
 * no scaling, no dimming and no smooth behaviour.
 */

const FRICTION = 0.94; // per frame; ~decelerates over 500-600ms
const MIN_VELOCITY = 0.2;

export function InertialSlider({
  count,
  label,
  renderItem,
  itemClass = "w-[78%] sm:w-[52%] lg:w-[38%]",
  onActiveChange,
}: {
  count: number;
  /** Accessible name for the group, e.g. "Site" or "Plans". */
  label: string;
  renderItem: (index: number, isActive: boolean) => ReactNode;
  /** Tailwind width for each slide; controls how many are visible at once. */
  itemClass?: string;
  onActiveChange?: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [dragging, setDragging] = useState(false);

  const momentum = useRef<number | null>(null);
  const drag = useRef<{ startX: number; startLeft: number; lastX: number; lastT: number; v: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const stopMomentum = useCallback(() => {
    if (momentum.current !== null) {
      cancelAnimationFrame(momentum.current);
      momentum.current = null;
    }
  }, []);

  /** Whichever slide's centre is nearest the track's centre is the active one. */
  const recalc = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    itemRefs.current.forEach((node, i) => {
      if (!node) return;
      const centre = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(centre - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive((prev) => {
      if (prev === best) return prev;
      onActiveChange?.(best);
      return best;
    });
  }, [onActiveChange]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    // rAF-throttled: scroll fires far more often than we need to re-measure.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        recalc();
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    recalc();
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [recalc, count]);

  useEffect(() => stopMomentum, [stopMomentum]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const node = itemRefs.current[index];
      if (!track || !node) return;
      stopMomentum();
      const left = node.offsetLeft - (track.clientWidth - node.offsetWidth) / 2;
      track.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced, stopMomentum],
  );

  /**
   * Step from where the track actually is, not from React state.
   *
   * `active` is updated by a rAF-throttled scroll listener, so it can lag the
   * real position by a frame — and a keypress arriving in that window would
   * step from a stale index and appear to do nothing. Measuring the nearest
   * slide at the moment of the press removes that race entirely.
   */
  const nearestIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    itemRefs.current.forEach((node, i) => {
      if (!node) return;
      const d = Math.abs(node.offsetLeft + node.offsetWidth / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, []);

  const step = useCallback(
    (delta: number) => goTo(Math.min(count - 1, Math.max(0, nearestIndex() + delta))),
    [count, goTo, nearestIndex],
  );

  /*
   * Keyboard is bound natively rather than through React's onKeyDown.
   * The track is a plain scroll container, and binding directly to it keeps
   * the handler independent of React's delegated event system — which matters
   * because the same handler has to respond to events the browser generates
   * for assistive technology, not only to user keystrokes React happens to see.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, () => void> = {
        ArrowRight: () => step(1),
        ArrowLeft: () => step(-1),
        Home: () => goTo(0),
        End: () => goTo(count - 1),
      };
      const run = map[e.key];
      if (!run) return;
      e.preventDefault();
      stopMomentum();
      run();
    };
    track.addEventListener("keydown", onKey);
    return () => track.removeEventListener("keydown", onKey);
  }, [step, goTo, count, stopMomentum]);

  // ---- pointer drag with a momentum tail (mouse; touch uses native scroll) --
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "touch") return; // let the platform scroll it
    const track = trackRef.current;
    if (!track) return;
    stopMomentum();
    setDragging(true);
    drag.current = {
      startX: e.clientX,
      startLeft: track.scrollLeft,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
    };
    track.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || !track) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.v = (e.clientX - d.lastX) / dt; // px per ms
    d.lastX = e.clientX;
    d.lastT = now;
    track.scrollLeft = d.startLeft - (e.clientX - d.startX);
  }

  function onPointerUp() {
    const d = drag.current;
    const track = trackRef.current;
    drag.current = null;
    setDragging(false);
    if (!d || !track) return;
    if (reduced) return recalc();

    let v = -d.v * 16; // px per frame
    const glide = () => {
      if (Math.abs(v) < MIN_VELOCITY) {
        momentum.current = null;
        return;
      }
      track.scrollLeft += v;
      v *= FRICTION;
      momentum.current = requestAnimationFrame(glide);
    };
    momentum.current = requestAnimationFrame(glide);
  }

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-30";

  if (count === 0) return null;

  return (
    <div>
      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        aria-roledescription="carousel"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        /*
         * `relative` is load bearing: slide positions are read with
         * `offsetLeft`, which is measured from the nearest positioned
         * ancestor. Without it the offsets are relative to some outer element,
         * the scroll target is computed wrong, and both keyboard navigation
         * and active-slide detection silently do nothing.
         *
         * Snap is `proximity`, not `mandatory`. Mandatory snapping re-anchors
         * the track on every frame of a programmatic smooth scroll, so
         * arrow-key and button navigation stalled part-way to the target
         * instead of arriving. Proximity still settles a free drag onto a
         * slide without fighting our own centring.
         */
        className={`rail relative flex snap-x snap-proximity gap-5 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        style={{ scrollbarWidth: "none" }}
      >
        {/* Half-viewport spacers, so the first and last slides can reach the
            centre rather than being pinned to the track edges. */}
        <span aria-hidden className="shrink-0 basis-[11%] sm:basis-[24%] lg:basis-[31%]" />
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={`shrink-0 snap-center ${itemClass} ${
              reduced
                ? ""
                : `transition-[transform,opacity] duration-500 ease-out ${
                    i === active ? "scale-100 opacity-100" : "scale-[0.94] opacity-55"
                  }`
            }`}
          >
            {renderItem(i, i === active)}
          </div>
        ))}
        <span aria-hidden className="shrink-0 basis-[11%] sm:basis-[24%] lg:basis-[31%]" />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <SlideCounter active={active} total={count} reduced={reduced} />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            className={arrow}
            aria-label={`Previous ${label} item`}
            onClick={() => step(-1)}
            disabled={active === 0}
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={arrow}
            aria-label={`Next ${label} item`}
            onClick={() => step(1)}
            disabled={active === count - 1}
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * "03 / 12" — the active number slides up as it changes, the total stays put.
 * `aria-live` announces the change once, on the whole readout, so a screen
 * reader hears "3 of 12" rather than two disconnected digits.
 */
function SlideCounter({ active, total, reduced }: { active: number; total: number; reduced: boolean }) {
  const pad = (n: number) => String(n + 1).padStart(2, "0");
  return (
    <p className="flex items-baseline gap-1" aria-live="polite" aria-atomic>
      <span className="sr-only">{`${active + 1} of ${total}`}</span>
      <span aria-hidden className="relative inline-block h-[1.1em] w-[2ch] overflow-hidden align-baseline">
        <span
          key={active}
          className={`data-mono absolute inset-0 text-[13px] ${reduced ? "" : "animate-[rise-in_0.32s_cubic-bezier(0.2,0.7,0.2,1)_both]"}`}
        >
          {pad(active)}
        </span>
      </span>
      <span aria-hidden className="label-mono">/ {String(total).padStart(2, "0")}</span>
    </p>
  );
}
