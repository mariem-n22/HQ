"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Detail popup for the condensed Experience / Identity cards. Matches the
 * lightbox's interaction contract: Escape closes, the backdrop closes, focus
 * moves in on open, is trapped while open and is restored on close.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: ReactNode;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  // Under reduced motion the panel appears with no transition at all, so the
  // animation props are omitted entirely rather than set to undefined
  // (exactOptionalPropertyTypes rejects the latter).
  const backdropMotion = reduced
    ? {}
    : { initial: { opacity: 0 }, exit: { opacity: 0 } };
  const panelMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.985 },
        exit: { opacity: 0, y: 8, scale: 0.99 },
      };

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === closeRef.current,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      // Wrap at both ends so Tab can never land behind the backdrop.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-base/90 p-4 backdrop-blur-sm sm:p-8"
          {...backdropMotion}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
            {...panelMotion}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="glow-card my-auto w-full max-w-2xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                {eyebrow}
                <h2 className="display-title mt-1 text-3xl text-ink sm:text-4xl">{title}</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-sm border border-line p-2 text-mute transition-colors hover:border-amber hover:text-amber"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
