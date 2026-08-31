"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImageIcon, Trash2, Upload } from "lucide-react";

export type GalleryItem = { url: string; caption: string; alt: string };

/**
 * Multi-image manager: add (multi-select or drop), reorder, remove, caption.
 *
 * The whole list is serialised into one hidden input as JSON so it rides along
 * with the surrounding form submit — the server action parses it back out and
 * rewrites the related rows. Same control drives the project gallery and the
 * hero gallery, so their mechanics cannot drift apart.
 */
export function GalleryField({ name, initial }: { name: string; initial: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadAll(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setError("No images in that selection.");
      return;
    }
    setBusy(true);
    setError("");
    const added: GalleryItem[] = [];
    for (const file of list) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
        added.push({ url: json.url, caption: "", alt: "" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      }
    }
    setItems((prev) => [...prev, ...added]);
    setBusy(false);
  }

  const move = (from: number, to: number) =>
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      return next;
    });

  const remove = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const setCaption = (index: number, caption: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, caption } : item)));

  return (
    <div className="mt-2">
      {/* Order in this array is the order that gets saved. */}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) void uploadAll(e.dataTransfer.files);
        }}
        className={`rounded-sm border border-dashed p-4 transition-colors ${
          dragging ? "border-amber bg-raised/60" : "border-line bg-surface"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-amber hover:text-amber disabled:opacity-50"
          >
            <Upload aria-hidden className="h-3 w-3" />
            Add images
          </button>
          <p className="text-xs text-mute">
            {busy
              ? "Uploading…"
              : items.length === 0
                ? "Drop images here, or choose files. Multi-select works."
                : `${items.length} image${items.length === 1 ? "" : "s"} — first is shown first.`}
          </p>
        </div>
        {error ? <p className="mt-2 text-xs text-signal">{error}</p> : null}

        {items.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {items.map((item, index) => (
              <li key={`${item.url}-${index}`} className="flex items-center gap-3 rounded-sm border border-line bg-base p-2">
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-sm border border-line">
                  {item.url ? (
                    <Image src={item.url} alt={item.alt || item.caption || "Gallery image"} fill sizes="64px" className="object-cover" />
                  ) : (
                    <ImageIcon aria-hidden className="h-4 w-4 text-mute" />
                  )}
                </span>

                <input
                  type="text"
                  value={item.caption}
                  placeholder="Caption (optional)"
                  onChange={(e) => setCaption(index, e.target.value)}
                  className="min-w-0 flex-1 rounded-sm border border-line-strong bg-base px-2 py-1.5 text-xs text-ink placeholder:text-mute focus:border-amber focus:outline-none"
                />

                <span className="data-mono shrink-0 text-[10px]">{index + 1}</span>

                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="rounded-sm border border-line p-1.5 text-mute hover:border-amber hover:text-amber disabled:opacity-30"
                  >
                    <ArrowLeft aria-hidden className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === items.length - 1}
                    aria-label="Move later"
                    className="rounded-sm border border-line p-1.5 text-mute hover:border-amber hover:text-amber disabled:opacity-30"
                  >
                    <ArrowRight aria-hidden className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Remove image"
                    className="rounded-sm border border-signal/60 p-1.5 text-signal hover:bg-signal hover:text-on-signal"
                  >
                    <Trash2 aria-hidden className="h-3 w-3" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void uploadAll(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
