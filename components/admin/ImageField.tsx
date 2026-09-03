"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";

/**
 * Image control: file picker (or drop) → /api/upload → Vercel Blob → preview.
 * The resulting URL is carried in a hidden input so the surrounding form
 * submits it like any other field. Clearing sets an empty string, which the
 * action turns into NULL.
 */
export function ImageField({
  name,
  initial,
  label,
  /**
   * Allow video as well as an image. Used by the home hero, which is one
   * asset that may be either — the upload route already has a `video` rule
   * with its own size ceiling, so this only widens the picker and tells the
   * route which limit to apply.
   */
  allowVideo = false,
}: {
  name: string;
  initial: string;
  label: string;
  allowVideo?: boolean;
}) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
        body.append("kind", file.type.startsWith("video/") ? "video" : "image");
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={`flex items-center gap-4 rounded-sm border border-dashed p-4 transition-colors ${
          dragging ? "border-amber bg-raised/60" : "border-line bg-surface"
        }`}
      >
        <span className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-raised/60">
          {url ? (
            <Image src={url} alt={label} fill sizes="96px" className="object-cover" />
          ) : (
            <ImageIcon aria-hidden className="h-5 w-5 text-mute" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-mute">
            {busy ? "Uploading…" : url ? "Image set." : "Drop an image here, or choose a file."}
          </p>
          {error ? <p className="mt-1 text-xs text-signal">{error}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-amber hover:text-amber disabled:opacity-50"
            >
              <Upload aria-hidden className="h-3 w-3" />
              Choose file
            </button>
            {url ? (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-signal hover:text-signal"
              >
                <X aria-hidden className="h-3 w-3" />
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={allowVideo ? "image/*,video/*" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
