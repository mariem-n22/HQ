"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GalleryImage } from "@/lib/data";
import { Frame } from "./Frame";

export function Gallery({ images, label = "Gallery" }: { images: GalleryImage[]; label?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;
  return (
    <section aria-label={label}>
      <p className="label-mono">{label}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group block w-full text-left"
              aria-label={`Open image ${index + 1}${image.caption ? `: ${image.caption}` : ""}`}
            >
              <div className="overflow-hidden">
                <Frame
                  src={image.url}
                  alt={image.alt ?? image.caption ?? `${label} image ${index + 1}`}
                  ratio="4/3"
                  tone={false}
                  className="transition-colors group-hover:border-amber/60 [&_img]:group-hover:scale-[1.04]"
                />
              </div>
              {image.caption ? (
                <p className="mt-2 text-xs leading-relaxed text-mute">{image.caption}</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (next: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      onIndex((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndex],
  );

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, onClose, step]);

  const current = index === null ? null : images[index];

  return (
    <AnimatePresence>
      {current ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-base/95 backdrop-blur-sm"
          onClick={onClose}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            const end = e.changedTouches[0]?.clientX ?? null;
            if (start !== null && end !== null && Math.abs(end - start) > 48) step(end < start ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="label-mono">
              {(index ?? 0) + 1} / {images.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="label-mono hover:text-amber"
            >
              Close ✕
            </button>
          </div>
          <div
            className="flex min-h-0 flex-1 items-center justify-center px-4 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 ? (
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => step(-1)}
                className="mr-3 shrink-0 border border-line px-3 py-6 text-mute transition-colors hover:border-amber hover:text-amber"
              >
                ←
              </button>
            ) : null}
            <motion.img
              key={current.url}
              src={current.url}
              alt={current.alt ?? current.caption ?? "Project image"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="max-h-full min-h-0 max-w-full object-contain"
            />
            {images.length > 1 ? (
              <button
                type="button"
                aria-label="Next image"
                onClick={() => step(1)}
                className="ml-3 shrink-0 border border-line px-3 py-6 text-mute transition-colors hover:border-amber hover:text-amber"
              >
                →
              </button>
            ) : null}
          </div>
          {current.caption ? (
            <p className="border-t border-line px-4 py-3 text-center text-xs text-mute">
              {current.caption}
            </p>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}