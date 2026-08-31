"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

/**
 * Dark/light switch.
 *
 * The authoritative value lives on `document.documentElement`, written before
 * first paint by the inline script in app/layout.tsx. This component reads it
 * back on mount rather than deriving its own, so the button can never
 * disagree with what is actually on screen.
 *
 * Rendering is deferred until after mount. Everything else on the page is a
 * Server Component with no knowledge of the visitor's stored preference, so
 * emitting a sun or a moon during SSR would be a coin flip — and a wrong
 * guess shows the visitor the icon for the mode they are already in.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";

    /*
     * Suppress every transition for the duration of the swap.
     *
     * This is not a nicety — without it the switch is broken. Any element
     * with a running or declared transition on `color` / `background-color`
     * / `border-color` stays pinned to its old value when the tokens those
     * properties read from change; Chrome does not re-resolve them. That
     * includes every component carrying Tailwind's `transition-colors`,
     * which expands to a list starting with `color`. Measured on the header
     * logo (`text-ink transition-colors`): a fresh light load gave the
     * correct rgb(24,24,23), but flipping the attribute at runtime left it
     * at rgb(24,24,23) on a dark ground — invisible.
     *
     * Killing transitions, committing the attribute, forcing a reflow so
     * the new values are painted with no animation in flight, then
     * restoring on the next frame, makes the swap instant and correct while
     * leaving hover/focus transitions untouched afterwards.
     */
    const damper = document.createElement("style");
    damper.appendChild(
      document.createTextNode("*,*::before,*::after{transition:none !important}"),
    );
    document.head.appendChild(damper);

    document.documentElement.setAttribute("data-theme", next);

    // Reading a layout property forces the style recalc to flush now.
    void window.getComputedStyle(document.body).opacity;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => damper.remove());
    });

    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or blocked storage: the switch still works for this
      // page view, it just will not be remembered. Not worth surfacing.
    }
  }

  // Reserve the footprint so the header does not reflow when the icon lands.
  const box =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
    "border border-line text-mute transition-colors hover:border-amber hover:text-amber " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";

  if (!theme) {
    return <span aria-hidden className={`${box} ${className}`} />;
  }

  const goingTo = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${box} ${className}`}
      // Names the destination, not the current state — that is what the
      // control does when pressed.
      aria-label={`Switch to ${goingTo} mode`}
      title={`Switch to ${goingTo} mode`}
    >
      {theme === "dark" ? (
        <Sun aria-hidden className="h-3.5 w-3.5" />
      ) : (
        <Moon aria-hidden className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
