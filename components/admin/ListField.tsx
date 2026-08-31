"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

/**
 * Repeatable single-line text input — one row per value, each individually
 * addable, removable and reorderable.
 *
 * Distinct from the existing `lines` type, which is one textarea split on
 * newlines: fine for terse bullet lists, wrong for book highlights, where each
 * entry is a full quoted sentence and needs to be edited as its own thing.
 *
 * Serialises to JSON in a hidden input so it rides the surrounding form submit,
 * matching how GalleryField already works.
 */
export function ListField({
  name,
  initial,
  placeholder,
}: {
  name: string;
  initial: string[];
  placeholder?: string;
}) {
  const [items, setItems] = useState<string[]>(initial.length > 0 ? initial : [""]);

  const set = (index: number, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));

  const add = () => setItems((prev) => [...prev, ""]);

  const remove = (index: number) =>
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });

  const move = (from: number, to: number) =>
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      if (moved !== undefined) next.splice(to, 0, moved);
      return next;
    });

  return (
    <div className="mt-2">
      {/* Blank rows are dropped by the action, so an empty trailing row is fine. */}
      <input type="hidden" name={name} value={JSON.stringify(items.filter((i) => i.trim()))} />

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="data-mono mt-2.5 w-5 shrink-0 text-right text-[10px]">
              {index + 1}
            </span>
            <textarea
              rows={2}
              value={item}
              placeholder={placeholder}
              onChange={(e) => set(index, e.target.value)}
              className="min-w-0 flex-1 rounded-sm border border-line-strong bg-base px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-amber focus:outline-none"
            />
            <span className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded-sm border border-line p-1 text-mute hover:border-amber hover:text-amber disabled:opacity-30"
              >
                <ArrowUp aria-hidden className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
                className="rounded-sm border border-line p-1 text-mute hover:border-amber hover:text-amber disabled:opacity-30"
              >
                <ArrowDown aria-hidden className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove"
                className="rounded-sm border border-signal/60 p-1 text-signal hover:bg-signal hover:text-on-signal"
              >
                <Trash2 aria-hidden className="h-3 w-3" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-amber hover:text-amber"
      >
        <Plus aria-hidden className="h-3 w-3" />
        Add another
      </button>
    </div>
  );
}
