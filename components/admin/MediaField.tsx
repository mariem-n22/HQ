"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Film, Trash2, Upload } from "lucide-react";

export type MediaRow = {
  category: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
  embedUrl: string;
  label: string;
  caption: string;
  alt: string;
  width?: number;
  height?: number;
};

/**
 * Each media category is its own labelled drop zone, so whoever enters a
 * project never has to guess where a file goes. The previous control was a
 * single flat multi-upload — every plan, material swatch and finished
 * photograph landed in one undifferentiated list, and the project page had no
 * way to tell them apart.
 */
const SECTIONS: { key: string; title: string; help: string; video?: boolean; labelled?: boolean }[] = [
  {
    key: "HERO",
    title: "Hero",
    help: "The opening image or film. One is enough — the first is used.",
    video: true,
  },
  {
    key: "GALLERY",
    title: "Final photography",
    help: "The finished building. Landscape, portrait and panoramic all render at their own shape.",
    video: true,
  },
  { key: "SITE", title: "Context / site", help: "The site before and around the building." },
  {
    key: "DIAGRAM",
    title: "Concept diagrams",
    help: "A short ordered sequence. Use the label for each step.",
    labelled: true,
  },
  { key: "PLAN", title: "Plans", help: "Site plan and floor plans. Upload at full resolution — these zoom.", labelled: true },
  { key: "SECTION", title: "Sections", help: "Upload at full resolution — these zoom.", labelled: true },
  { key: "ELEVATION", title: "Elevations", help: "Upload at full resolution — these zoom.", labelled: true },
  {
    key: "MATERIAL",
    title: "Materials",
    help: "One swatch per material. The label is the material name and is shown.",
    labelled: true,
  },
  { key: "CONSTRUCTION", title: "Construction", help: "Process and detail photography. Optional." },
];

/** Read intrinsic dimensions before upload so galleries can lay out to shape. */
function measure(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (d: { width?: number; height?: number }) => {
      URL.revokeObjectURL(url);
      resolve(d);
    };
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => done({ width: v.videoWidth, height: v.videoHeight });
      v.onerror = () => done({});
      v.src = url;
      return;
    }
    const img = new Image();
    img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => done({});
    img.src = url;
  });
}

export function MediaField({ name, initial }: { name: string; initial: MediaRow[] }) {
  const [rows, setRows] = useState<MediaRow[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const grouped = useMemo(() => {
    const out: Record<string, { row: MediaRow; at: number }[]> = {};
    for (const s of SECTIONS) out[s.key] = [];
    rows.forEach((row, at) => {
      (out[row.category] ??= []).push({ row, at });
    });
    return out;
  }, [rows]);

  async function upload(category: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(category);
    setError(null);
    const added: MediaRow[] = [];
    for (const file of Array.from(files)) {
      try {
        const isVideo = file.type.startsWith("video/");
        const dims = await measure(file);
        const body = new FormData();
        body.append("file", file);
        body.append("kind", isVideo ? "video" : "image");
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
        added.push({
          category,
          kind: isVideo ? "VIDEO" : "IMAGE",
          url: json.url,
          embedUrl: "",
          label: "",
          caption: "",
          alt: "",
          width: dims.width,
          height: dims.height,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      }
    }
    if (added.length) setRows((prev) => [...prev, ...added]);
    setBusy(null);
  }

  function patch(at: number, next: Partial<MediaRow>) {
    setRows((prev) => prev.map((row, i) => (i === at ? { ...row, ...next } : row)));
  }

  function remove(at: number) {
    setRows((prev) => prev.filter((_, i) => i !== at));
  }

  /** Move within the category by swapping with the neighbour in that group. */
  function move(category: string, position: number, delta: number) {
    const group = grouped[category];
    const target = group[position + delta];
    if (!target) return;
    const a = group[position].at;
    const b = target.at;
    setRows((prev) => {
      const copy = [...prev];
      [copy[a], copy[b]] = [copy[b], copy[a]];
      return copy;
    });
  }

  function addEmbed(category: string) {
    setRows((prev) => [
      ...prev,
      { category, kind: "VIDEO", url: "", embedUrl: "", label: "", caption: "", alt: "" },
    ]);
  }

  const input =
    "w-full rounded-sm border border-line-strong bg-base px-2 py-1.5 text-xs text-ink placeholder:text-mute focus:border-amber focus:outline-none";

  return (
    <div className="space-y-8">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {error ? (
        <p role="alert" className="rounded-sm border border-signal/60 px-3 py-2 text-xs text-signal">
          {error}
        </p>
      ) : null}

      {SECTIONS.map((section) => {
        const group = grouped[section.key] ?? [];
        return (
          <fieldset key={section.key} className="rounded-sm border border-line bg-surface p-4">
            <legend className="label-mono px-1">{section.title}</legend>
            <p className="mt-1 text-xs text-mute">{section.help}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputs.current[section.key]?.click()}
                disabled={busy === section.key}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:border-amber hover:text-amber disabled:opacity-50"
              >
                <Upload aria-hidden className="h-3 w-3" />
                {busy === section.key ? "Uploading…" : section.video ? "Add image or video" : "Add image"}
              </button>
              {section.video ? (
                <button
                  type="button"
                  onClick={() => addEmbed(section.key)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:border-amber hover:text-amber"
                >
                  <Film aria-hidden className="h-3 w-3" />
                  Add video link
                </button>
              ) : null}
              <input
                ref={(el) => {
                  inputs.current[section.key] = el;
                }}
                type="file"
                accept={section.video ? "image/*,video/*" : "image/*"}
                multiple
                hidden
                onChange={(e) => {
                  void upload(section.key, e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {group.length === 0 ? (
              <p className="mt-3 text-xs text-mute">Nothing here yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {group.map(({ row, at }, position) => (
                  <li key={`${section.key}-${at}`} className="flex gap-3 rounded-sm border border-line bg-base p-2">
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-raised/60">
                      {row.kind === "VIDEO" && !row.url ? (
                        <Film aria-hidden className="h-4 w-4 text-mute" />
                      ) : row.kind === "VIDEO" ? (
                        <video src={row.url} muted className="h-full w-full object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>

                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                      {row.kind === "VIDEO" && !row.url ? (
                        <input
                          className={`${input} sm:col-span-2`}
                          placeholder="Vimeo or YouTube URL"
                          value={row.embedUrl}
                          onChange={(e) => patch(at, { embedUrl: e.target.value })}
                        />
                      ) : null}
                      {section.labelled ? (
                        <input
                          className={input}
                          placeholder={section.key === "MATERIAL" ? "Material name" : "Label"}
                          value={row.label}
                          onChange={(e) => patch(at, { label: e.target.value })}
                        />
                      ) : null}
                      <input
                        className={input}
                        placeholder="Caption"
                        value={row.caption}
                        onChange={(e) => patch(at, { caption: e.target.value })}
                      />
                      <input
                        className={`${input} ${section.labelled ? "" : "sm:col-span-2"}`}
                        placeholder="Alt text (described for screen readers)"
                        value={row.alt}
                        onChange={(e) => patch(at, { alt: e.target.value })}
                      />
                      {row.width && row.height ? (
                        <p className="label-mono sm:col-span-2">
                          {row.width}×{row.height}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        aria-label="Move earlier"
                        onClick={() => move(section.key, position, -1)}
                        disabled={position === 0}
                        className="rounded-sm border border-line p-1 text-mute hover:border-amber hover:text-amber disabled:opacity-30"
                      >
                        <ArrowLeft aria-hidden className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move later"
                        onClick={() => move(section.key, position, 1)}
                        disabled={position === group.length - 1}
                        className="rounded-sm border border-line p-1 text-mute hover:border-amber hover:text-amber disabled:opacity-30"
                      >
                        <ArrowRight aria-hidden className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => remove(at)}
                        className="rounded-sm border border-signal/60 p-1 text-signal hover:bg-signal hover:text-on-signal"
                      >
                        <Trash2 aria-hidden className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
