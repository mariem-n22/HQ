"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import type { NavGroup } from "@/lib/types";

const linkClass =
  "link-underline whitespace-nowrap text-[13px] tracking-wide text-mute transition-colors hover:text-ink";

/**
 * Desktop dropdown for one nav group.
 *
 * Opens on hover for a pointer and on click for everything else, and closes on
 * Escape, on outside click, and when focus leaves the group. Deliberately a
 * plain button plus a list rather than a menu widget: these are links to pages,
 * so `aria-expanded` on a disclosure button is the honest description, and it
 * keeps Tab moving through the links the way it does everywhere else on the
 * site. No new dependency for this.
 *
 * The panel is only rendered when open, so the links inside are not silent tab
 * stops while collapsed.
 */
export function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`${linkClass} inline-flex items-center gap-1.5`}
      >
        {group.label}
        <ChevronDown
          aria-hidden
          className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""} motion-reduce:transition-none`}
        />
      </button>

      {open ? (
        <div id={panelId} className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <ul className="flex min-w-[11rem] flex-col gap-2 border border-line bg-surface px-4 py-3 shadow-lg">
            {group.children.map((child) => (
              <li key={child.to}>
                <Link href={child.to} className={linkClass} onClick={() => setOpen(false)}>
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Mobile accordion for one nav group.
 *
 * The compact bar has no hover, so the group is a real expand/collapse rather
 * than a hidden dropdown: tapping the label reveals its children in flow and
 * pushes the rest of the bar down. Only one section is open at a time, which
 * keeps the header from swallowing the page on a phone.
 */
export function NavAccordion({
  group,
  open,
  onToggle,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  return (
    <div className="w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={`${linkClass} inline-flex min-h-[44px] items-center gap-1.5`}
      >
        {group.label}
        <ChevronDown
          aria-hidden
          className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""} motion-reduce:transition-none`}
        />
      </button>
      {open ? (
        <ul id={panelId} className="mb-1 flex flex-col gap-2 border-l border-line pl-4">
          {group.children.map((child) => (
            <li key={child.to}>
              <Link href={child.to} className={`${linkClass} inline-flex min-h-[44px] items-center`}>
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Mobile navigation: a hamburger trigger and the drawer it opens.
 *
 * The previous version rendered the group list inline in a bar under the
 * header, always visible. Collapsing a group hid its children but never the
 * group itself, so the whole nav sat permanently on the page pushing content
 * down — it was an accordion with no trigger in front of it, not a menu.
 *
 * The drawer follows the interaction contract the Modal and the media viewer
 * already set: framer-motion for the transition, Escape closes, the backdrop
 * closes, focus moves in and is restored on close, and the page behind is
 * scroll-locked while it is open. Navigating closes it too, since the shell
 * does not always remount between routes.
 *
 * The groups it receives are already filtered by SiteShell, so the
 * hide-when-empty rule reaches the drawer by construction rather than by a
 * second copy of the logic.
 */
export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  // The drawer is portalled to <body>. It has to be, not as a nicety: the
  // header carries `backdrop-blur`, and a backdrop-filter establishes a
  // containing block for fixed-position descendants — so a `fixed inset-0`
  // drawer rendered inside the header resolves against the header's box and
  // is clipped to its height instead of covering the viewport.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:hidden"
      >
        <Menu aria-hidden className="h-4 w-4" />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
          <motion.div
            key="drawer"
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-base/80 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              id={panelId}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col border-l border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="label-mono">Menu</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-amber hover:text-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>

              <nav
                aria-label="Sections"
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-5"
                onClick={(e) => {
                  // Any link inside navigates, so the drawer should not be
                  // left open behind the new page.
                  if ((e.target as HTMLElement).closest("a")) setOpen(false);
                }}
              >
                {groups.map((group) => (
                  <NavAccordion
                    key={group.label}
                    group={group}
                    open={openLabel === group.label}
                    onToggle={() =>
                      setOpenLabel((cur) => (cur === group.label ? null : group.label))
                    }
                  />
                ))}
                <Link
                  href="/contact"
                  className={`${linkClass} inline-flex min-h-[44px] items-center`}
                >
                  Contact
                </Link>
              </nav>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
