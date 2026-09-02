"use client";

import { useState } from "react";
import type { NowEntry } from "@/lib/types";
import { Frame } from "./Frame";
import { Modal } from "./Modal";

/**
 * Now entries, opening into the same popup Experience uses.
 *
 * The shared `Modal` is reused directly — same focus trap, same Escape and
 * backdrop handling — rather than a third implementation. This is now the
 * fourth caller alongside Experience, Identity and Certifications.
 *
 * An entry only becomes clickable when it actually has something more to
 * show. `details` is optional, and a card with none stays a plain list item:
 * turning every card into a button that opens a popup repeating the line
 * already on screen would be a worse interaction than no popup at all.
 */
export function NowList({ entries }: { entries: NowEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = entries.find((e) => e.id === openId) ?? null;

  return (
    <>
      <ul className="grid gap-4">
        {entries.map((entry) => {
          const expandable = Boolean(entry.details?.trim());
          const body = (
            <>
              <span
                aria-hidden
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  entry.active ? "pulse-pip bg-go" : "bg-line"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="data-mono text-[11px] tracking-widest">
                  {entry.date.toISOString().slice(0, 10)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/90">{entry.text}</p>
                {/* Optional by design — nothing is rendered when absent, unlike
                    covers and galleries which always reserve a placeholder. */}
                {entry.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.image}
                    alt=""
                    loading="lazy"
                    className="mt-3 max-h-56 w-full rounded-sm border border-line object-cover sm:max-w-sm"
                  />
                ) : null}
                {expandable ? (
                  <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                    Full detail →
                  </span>
                ) : null}
              </div>
            </>
          );

          return (
            <li key={entry.id}>
              {expandable ? (
                <button
                  type="button"
                  onClick={() => setOpenId(entry.id)}
                  aria-haspopup="dialog"
                  className="glow-card flex w-full gap-4 p-5 text-left"
                >
                  {body}
                </button>
              ) : (
                <div className="glow-card flex gap-4 p-5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <Modal
        open={Boolean(active)}
        onClose={() => setOpenId(null)}
        title={active?.text ?? ""}
        eyebrow={
          <p className="label-mono text-amber">
            {active ? active.date.toISOString().slice(0, 10) : ""}
          </p>
        }
      >
        {active ? (
          <div className="space-y-6">
            {active.image ? (
              <Frame src={active.image} alt="" ratio="16/9" tone={false} className="rounded-md" />
            ) : null}
            <div className="space-y-4 text-sm leading-relaxed text-ink/90">
              {(active.details ?? "").split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
