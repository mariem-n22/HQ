"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal scroll-snap rail with telemetry-style controls. The scrolling
 * itself is plain CSS, so touch-swipe, trackpad and keyboard all work with no
 * JS; the arrows, the drag-to-scroll and the position readout sit on top.
 *
 * Reduced motion only flattens the easing — paging snaps instantly instead of
 * animating. The ability to scroll is never removed.
 */

/** Distance from one card to the next, gap included. */
function stepOf(track: HTMLElement) {
  const first = track.children[0] as HTMLElement | undefined;
  const second = track.children[1] as HTMLElement | undefined;
  if (!first) return 0;
  return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
}

const DRAG_THRESHOLD = 6;

export function Slider({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [rail, setRail] = useState({ prev: false, next: true, index: 0, count: 0 });

  // Drag-to-scroll bookkeeping. `moved` also suppresses the click that would
  // otherwise fire on the card link at the end of a drag.
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = stepOf(track);
    const max = track.scrollWidth - track.clientWidth;
    setRail({
      prev: track.scrollLeft > 8,
      next: track.scrollLeft < max - 8,
      index: step > 0 ? Math.round(track.scrollLeft / step) : 0,
      count: track.children.length,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const page = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollBy({
        left: stepOf(track) * direction,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Touch and pen already scroll natively; only mouse needs drag emulation.
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      moved: false,
    };
    // Snapping fights a free drag — turn it off until the pointer is released.
    track.style.scrollSnapType = "none";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!drag.current.active || !track) return;
    const dx = event.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true;
      track.setPointerCapture?.(event.pointerId);
    }
    if (drag.current.moved) track.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!drag.current.active || !track) return;
    drag.current.active = false;
    track.style.scrollSnapType = "";
    if (track.hasPointerCapture?.(event.pointerId)) track.releasePointerCapture(event.pointerId);
    // Leave `moved` set so the click handler below can swallow the click; it is
    // reset on the next pointerdown.
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      page(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      page(-1);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="label-mono text-amber">{label}</h2>
        <div className="flex items-center gap-3">
          {rail.count > 0 ? (
            <p className="data-mono text-[11px] tracking-widest" aria-hidden>
              {String(Math.min(rail.index + 1, rail.count)).padStart(2, "0")} /{" "}
              {String(rail.count).padStart(2, "0")}
            </p>
          ) : null}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={!rail.prev}
              aria-label={`Previous — ${label}`}
              className="rounded-sm border border-line p-1.5 text-mute transition-colors hover:border-amber hover:text-amber disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              disabled={!rail.next}
              aria-label={`Next — ${label}`}
              className="rounded-sm border border-line p-1.5 text-mute transition-colors hover:border-amber hover:text-amber disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fade only the edge that actually has more content behind it. */}
      <div className={rail.prev && rail.next ? "rail-fade-x" : rail.next ? "rail-fade-r" : rail.prev ? "rail-fade-l" : undefined}>
        <div
          ref={trackRef}
          role="region"
          aria-label={`${label} — use arrow keys to scroll`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          /* snap-proximity, not mandatory: dragging feels like scrolling a
             strip and can rest between cards, while arrow paging still lands
             cleanly on a card edge. */
          className="rail mt-6 flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-amber"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
