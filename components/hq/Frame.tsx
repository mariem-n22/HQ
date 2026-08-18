"use client";

import { useState } from "react";

/**
 * Editorial image frame: fixed aspect box, hairline border, grain + a soft
 * indigo wash so photography sits inside the design system instead of on it.
 */
export function Frame({
  src,
  alt,
  ratio = "4/3",
  className = "",
  tone = true,
  priority = false,
}: {
  src?: string | null | undefined;
  alt: string;
  ratio?: string;
  className?: string;
  tone?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(src) && !failed;
  return (
    <div
      className={`relative overflow-hidden border border-line bg-surface ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {show ? (
        <img
          src={src as string}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-700 ease-out"
        />
      ) : (
        <div className="carbon flex h-full w-full flex-col items-center justify-center gap-3 bg-raised/40">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="h-8 w-8 text-mute/70"
          >
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="M3 16.5l4.5-4.5 4 4 3.5-3 6 6" />
          </svg>
          <span className="label-mono">No image yet</span>
        </div>
      )}
      {tone && show ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/70 via-base/5 to-transparent"
        />
      ) : null}
    </div>
  );
}