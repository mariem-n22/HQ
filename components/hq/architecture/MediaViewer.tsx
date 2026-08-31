"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { embedSrc } from "@/lib/types";

const MIN = 1;
const MAX = 6;

/**
 * Full-screen viewer with zoom.
 *
 * Drawings are the reason this exists. A site plan or a section at grid-tile
 * size conveys nothing; the whole point of publishing them is that a visitor
 * can read the dimensions. So the viewer supports wheel/trackpad zoom, pinch,
 * double-click/tap to toggle, drag-to-pan once magnified, and explicit
 * +/−/reset buttons for anyone who has none of those gestures available.
 *
 * Deliberately not a CAD viewer — no layers, no measure tool. Just legibility.
 *
 * Accessibility notes: focus moves into the dialog and is restored on close,
 * Escape closes, arrows step between items, and every control clears the
 * 44×44 minimum. Native pinch-zoom is not blocked; the handler augments it.
 */
export function MediaViewer({
  items,
  index,
  onClose,
  onIndex,
  zoomable = false,
}: {
  items: MediaItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (next: number) => void;
  zoomable?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const touch = useRef<number | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (index === null || items.length === 0) return;
      reset();
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex, reset],
  );

  useEffect(() => {
    if (index === null) return;
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // preventDefault, or the arrow keys scroll the locked page underneath
      // and the viewer drifts off-centre as you page through a set.
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
      if (zoomable && (e.key === "+" || e.key === "=")) setScale((s) => Math.min(MAX, s + 0.5));
      if (zoomable && e.key === "-") setScale((s) => Math.max(MIN, s - 0.5));
      if (zoomable && e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [index, onClose, step, zoomable, reset]);

  // Non-passive so the page does not scroll behind a trackpad pinch.
  useEffect(() => {
    const node = surfaceRef.current;
    if (!node || !zoomable || index === null) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      setScale((s) => Math.min(MAX, Math.max(MIN, s - e.deltaY * 0.005)));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [zoomable, index]);

  const current = index === null ? null : items[index];
  if (!current) return null;

  const embed = current.kind === "VIDEO" && current.embedUrl ? embedSrc(current.embedUrl) : null;
  const canPan = zoomable && scale > 1;
  const btn =
    "inline-flex h-11 w-11 items-center justify-center border border-line text-mute transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-40";

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={zoomable ? "Drawing viewer" : "Image viewer"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col bg-base/95 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
          <span className="label-mono pl-1">
            {(index ?? 0) + 1} / {items.length}
            {current.label ? ` · ${current.label}` : ""}
          </span>
          <div className="flex items-center gap-2">
            {zoomable ? (
              <>
                <button
                  type="button"
                  className={btn}
                  aria-label="Zoom out"
                  disabled={scale <= MIN}
                  onClick={() => setScale((s) => Math.max(MIN, s - 0.5))}
                >
                  <Minus aria-hidden className="h-4 w-4" />
                </button>
                <span className="label-mono w-12 text-center" aria-live="polite">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  className={btn}
                  aria-label="Zoom in"
                  disabled={scale >= MAX}
                  onClick={() => setScale((s) => Math.min(MAX, s + 0.5))}
                >
                  <Plus aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" className={btn} aria-label="Reset zoom" onClick={reset}>
                  <RotateCcw aria-hidden className="h-4 w-4" />
                </button>
              </>
            ) : null}
            <button ref={closeRef} type="button" className={btn} aria-label="Close viewer" onClick={onClose}>
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1">
        {items.length > 1 ? (
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => step(-1)}
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-base/80 text-mute backdrop-blur-sm transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
        ) : null}
        {items.length > 1 ? (
          <button
            type="button"
            aria-label="Next image"
            onClick={() => step(1)}
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-base/80 text-mute backdrop-blur-sm transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        ) : null}
        <div
          ref={surfaceRef}
          className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-16 py-4"
          style={{ cursor: canPan ? (drag.current ? "grabbing" : "grab") : "auto" }}
          onDoubleClick={() => (zoomable ? (scale > 1 ? reset() : setScale(2.5)) : undefined)}
          onPointerDown={(e) => {
            if (!canPan) return;
            drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
            (e.target as Element).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            setOffset({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 2 && zoomable) {
              const [a, b] = [e.touches[0], e.touches[1]];
              pinch.current = { dist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), scale };
            } else if (e.touches.length === 1) {
              touch.current = e.touches[0]?.clientX ?? null;
            }
          }}
          onTouchMove={(e) => {
            const p = pinch.current;
            if (p && e.touches.length === 2) {
              const [a, b] = [e.touches[0], e.touches[1]];
              const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
              setScale(Math.min(MAX, Math.max(MIN, (p.scale * dist) / p.dist)));
            }
          }}
          onTouchEnd={(e) => {
            pinch.current = null;
            // Swipe only when not magnified, so panning a zoomed drawing
            // never yanks the viewer to the next sheet.
            const start = touch.current;
            const end = e.changedTouches[0]?.clientX ?? null;
            if (scale === 1 && start !== null && end !== null && Math.abs(end - start) > 48) {
              step(end < start ? 1 : -1);
            }
            touch.current = null;
          }}
        >
          {embed ? (
            <div className="aspect-video w-full max-w-5xl">
              <iframe
                src={embed}
                title={current.label ?? current.caption ?? "Project video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full border border-line"
              />
            </div>
          ) : current.kind === "VIDEO" ? (
            <video
              src={current.url}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-full max-w-full"
              aria-label={current.alt ?? "Project video"}
            />
          ) : (
            <img
              key={current.url}
              src={current.url}
              alt={current.alt ?? current.caption ?? current.label ?? "Project image"}
              draggable={false}
              className="max-h-full min-h-0 max-w-full object-contain select-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: drag.current || pinch.current ? "none" : "transform 0.2s ease-out",
              }}
            />
          )}
        </div>

        </div>

        {current.caption ? (
          <p className="border-t border-line px-4 py-3 text-center text-xs text-mute">
            {current.caption}
          </p>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
