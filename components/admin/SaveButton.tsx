"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Submit button that reports its own outcome, so a save never looks silent.
 *
 * The dashboard's forms are long — Settings and the Project form both scroll
 * well past a viewport — so a banner at the top of the page is easy to miss
 * entirely. The confirmation belongs where the click happened.
 *
 * Motion follows the site's restrained convention: a short crossfade, and
 * nothing at all under prefers-reduced-motion (the label and icon still
 * change, so the state is never conveyed by animation alone).
 */
export function SaveButton({
  state,
  idleLabel,
  savedLabel = "Saved",
  onSettled,
  className = "",
}: {
  state: SaveState;
  idleLabel: string;
  savedLabel?: string;
  /** Called once the success/error state has been shown long enough to read. */
  onSettled?: () => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<SaveState>(state);

  useEffect(() => {
    setShown(state);
    if (state !== "saved" && state !== "error") return;
    // Long enough to register, short enough not to nag.
    const ms = state === "saved" ? 2000 : 4000;
    const timer = window.setTimeout(() => {
      setShown("idle");
      onSettled?.();
    }, ms);
    return () => window.clearTimeout(timer);
  }, [state, onSettled]);

  const tone =
    shown === "saved"
      ? "border-go bg-go text-base"
      : shown === "error"
        ? "border-signal bg-signal text-ink"
        : "border-amber bg-amber text-base";

  const content =
    shown === "saving" ? (
      <>
        <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </>
    ) : shown === "saved" ? (
      <>
        <Check aria-hidden className="h-3.5 w-3.5" />
        {savedLabel}
      </>
    ) : shown === "error" ? (
      <>
        <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
        Didn&rsquo;t save
      </>
    ) : (
      idleLabel
    );

  return (
    <button
      type="submit"
      disabled={shown === "saving"}
      // Announce the outcome to screen readers as well as showing it.
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 disabled:opacity-70 ${tone} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={shown}
          className="inline-flex items-center gap-2"
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, y: 3 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -3 },
                transition: { duration: 0.16 },
              })}
        >
          {content}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
