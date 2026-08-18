"use client";

import { useState } from "react";
import type { IdentityMoment } from "@/lib/types";
import { summarize } from "@/lib/summary";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";
import { Modal } from "./Modal";

/**
 * The identity lap chart: condensed moment cards that open the full write-up
 * in the same popup the Experience section uses, with that moment's gallery
 * running through the existing lightbox.
 */
export function IdentityTimeline({ moments }: { moments: IdentityMoment[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = moments.find((moment) => moment.id === openId) ?? null;

  return (
    <>
      <ol className="grid gap-4 sm:grid-cols-2">
        {moments.map((moment, i) => (
          <Reveal as="li" key={moment.id} delay={Math.min(i, 4) * 0.06} className="h-full">
            <button
              type="button"
              onClick={() => setOpenId(moment.id)}
              aria-haspopup="dialog"
              className="glow-card flex h-full w-full flex-col overflow-hidden text-left"
            >
              <Frame
                src={moment.image}
                alt={moment.title}
                ratio="16/9"
                tone={false}
                className="rounded-t-3xl border-0 border-b border-line"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline gap-3">
                  <span className="data-mono text-2xl opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="data-mono text-[11px] tracking-widest">{moment.year}</span>
                </div>
                <h3 className="display-title mt-1 text-2xl text-cyan">{moment.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{summarize(moment)}</p>
                <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                  Full detail →
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </ol>

      <Modal
        open={Boolean(active)}
        onClose={() => setOpenId(null)}
        title={active?.title ?? ""}
        eyebrow={<p className="label-mono text-amber">{active?.year}</p>}
      >
        {active ? (
          <div className="space-y-6">
            {active.image ? (
              <Frame
                src={active.image}
                alt={active.title}
                ratio="16/9"
                tone={false}
                className="rounded-md"
              />
            ) : null}

            <div className="space-y-4 text-sm leading-relaxed text-ink/90">
              {active.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
