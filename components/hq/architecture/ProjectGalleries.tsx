"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/types";
import { orientationOf } from "@/lib/types";
import { MediaFigure } from "./MediaFigure";
import { MediaViewer } from "./MediaViewer";
import { InertialSlider } from "./InertialSlider";

/**
 * Final photography — full-bleed, mixed aspect ratios.
 *
 * Each frame keeps its own shape, and the column span is chosen from that
 * shape: a panorama takes the full width, a landscape takes two of three
 * columns, a portrait takes one. That is what stops a wide exterior shot from
 * being cropped into the same box as a stairwell detail, which is exactly what
 * the previous fixed-4/3 grid did to everything.
 */
export function PhotographyGallery({ items, label = "Photography" }: { items: MediaItem[]; label?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) return null;

  return (
    <section aria-label={label}>
      <p className="label-mono text-amber">{label}</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-6">
        {items.map((item, i) => {
          const o = orientationOf(item);
          const span =
            o === "panorama"
              ? "sm:col-span-6"
              : o === "portrait"
                ? "sm:col-span-2"
                : o === "square"
                  ? "sm:col-span-3"
                  : "sm:col-span-4"; // landscape, and the unknown-dimension default
          return (
            <figure key={`${item.url}-${i}`} className={span}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                aria-label={`Open ${item.caption ?? item.label ?? `image ${i + 1}`}`}
              >
                <MediaFigure
                  item={item}
                  fallbackRatio="3 / 2"
                  className="border border-line"
                  imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
                  sizes="(min-width: 640px) 66vw, 100vw"
                />
              </button>
              {item.caption ? (
                <figcaption className="mt-2 text-xs leading-relaxed text-mute">{item.caption}</figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
      <MediaViewer items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}

/**
 * A horizontal strip of photographs.
 *
 * Used for Site, where the pictures are a sequence you move along rather than
 * a composition you take in at once. Final photography stays a grid: there the
 * mixed aspect ratios are the point, and a single-file strip would flatten a
 * panorama and a portrait into the same slot.
 */
export function PhotoStrip({ items, label }: { items: MediaItem[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <section aria-label={label}>
      <p className="label-mono text-amber">{label}</p>
      <div className="mt-6">
        <InertialSlider
          count={items.length}
          label={label}
          itemClass="w-[82%] sm:w-[56%] lg:w-[42%]"
          renderItem={(i) => {
            const item = items[i];
            return (
              <figure>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                  aria-label={`Open ${item.caption ?? `${label} image ${i + 1}`}`}
                >
                  <MediaFigure
                    item={item}
                    fallbackRatio="3 / 2"
                    className="border border-line"
                    sizes="(min-width: 1024px) 42vw, 82vw"
                  />
                </button>
                {item.caption ? (
                  <figcaption className="mt-2 text-xs leading-relaxed text-mute">
                    {item.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }}
        />
      </div>
      <MediaViewer items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}

/**
 * Drawings — plans, sections, elevations.
 *
 * Each category is its own strip, so a set of plans is never interleaved with
 * elevations while browsing. Only the selection layer changed here: choosing a
 * sheet still opens the same zoom/pan MediaViewer, and the viewer's own array
 * is scoped to the category you were browsing so its prev/next steps through
 * comparable drawings rather than jumping between plan and section.
 */
export function DrawingSet({ groups }: { groups: { label: string; items: MediaItem[] }[] }) {
  const present = groups.filter((g) => g.items.length > 0);
  if (present.length === 0) return null;
  return (
    <section aria-label="Drawings">
      <p className="label-mono text-amber">Drawings</p>
      <p className="mt-2 text-sm text-mute">Select a drawing to enlarge.</p>
      <div className="mt-6 space-y-12">
        {present.map((group) => (
          <DrawingStrip key={group.label} label={group.label} items={group.items} />
        ))}
      </div>
    </section>
  );
}

function DrawingStrip({ label, items }: { label: string; items: MediaItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <h3 className="label-mono">{label}</h3>
      <div className="mt-3">
        <InertialSlider
          count={items.length}
          label={label}
          itemClass="w-[80%] sm:w-[50%] lg:w-[36%]"
          renderItem={(i) => {
            const item = items[i];
            return (
              <figure>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                  aria-label={`Enlarge ${item.label || label} ${i + 1}`}
                >
                  <MediaFigure
                    item={item}
                    fallbackRatio="4 / 3"
                    fit="contain"
                    className="border border-line bg-surface p-3 transition-colors group-hover:border-amber"
                    sizes="(min-width: 1024px) 36vw, 80vw"
                  />
                </button>
                {item.caption || item.label ? (
                  <figcaption className="mt-2 text-xs text-mute">
                    {item.caption ?? item.label}
                  </figcaption>
                ) : null}
              </figure>
            );
          }}
        />
      </div>
      <MediaViewer items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} zoomable />
    </div>
  );
}

/**
 * Concept diagrams as a horizontal sequence.
 *
 * A concept set is read in order, so it slides rather than tiling: the reader
 * moves through the argument one step at a time instead of scanning a grid.
 * Selecting a step still opens the zoom viewer.
 */
export function DiagramSequence({ items }: { items: MediaItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <section aria-label="Concept">
      <p className="label-mono text-amber">Concept</p>
      <div className="mt-6">
        <InertialSlider
          count={items.length}
          label="Concept"
          itemClass="w-[70%] sm:w-[44%] lg:w-[30%]"
          renderItem={(i) => {
            const item = items[i];
            return (
              <figure>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
                  aria-label={`Enlarge diagram ${i + 1}`}
                >
                  <MediaFigure
                    item={item}
                    fallbackRatio="1 / 1"
                    fit="contain"
                    className="border border-line bg-surface p-4 transition-colors group-hover:border-amber"
                    sizes="(min-width: 1024px) 30vw, 70vw"
                  />
                </button>
                <figcaption className="mt-2 flex gap-2 text-xs text-mute">
                  <span className="data-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item.label ?? item.caption ?? ""}</span>
                </figcaption>
              </figure>
            );
          }}
        />
      </div>
      <MediaViewer items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} zoomable />
    </section>
  );
}

/** Materials — a small palette. Image plus the material's name, nothing more. */
export function MaterialPalette({ items }: { items: MediaItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Materials">
      <p className="label-mono text-amber">Materials</p>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item, i) => (
          <li key={`${item.url}-${i}`}>
            <MediaFigure item={item} fallbackRatio="1 / 1" className="border border-line" sizes="20vw" />
            {item.label ? <p className="mt-2 text-xs text-ink">{item.label}</p> : null}
            {item.caption ? <p className="text-xs text-mute">{item.caption}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
