"use client";

import { useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import type { Experience } from "@/lib/types";
import { summarize } from "@/lib/summary";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";
import { Modal } from "./Modal";

function MetaRow({
  period,
  location,
  className = "",
}: {
  period: string;
  location: string | null;
  className?: string;
}) {
  return (
    <p
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide text-mute ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden className="h-3.5 w-3.5" />
        {period}
      </span>
      {location ? (
        <span className="inline-flex items-center gap-1.5">
          <MapPin aria-hidden className="h-3.5 w-3.5" />
          {location}
        </span>
      ) : null}
    </p>
  );
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-sm border border-line bg-raised/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mute"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Career journey as a staggered timeline: a single rule down the middle with a
 * dot per role, cards alternating left and right of it. Below `md` the rule
 * moves to the left edge and every card stacks against it, because alternating
 * sides on a phone just makes both columns too narrow to read.
 */
export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = experiences.find((item) => item.id === openId) ?? null;

  return (
    <>
      <div className="relative">
        {/* The connecting line: left edge on mobile, centred from md up. */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-[7px] w-px bg-gradient-to-b from-transparent via-line to-transparent md:left-1/2 md:-translate-x-1/2"
        />

        <ol className="space-y-6">
          {experiences.map((item, i) => {
            const onLeft = i % 2 === 0;
            return (
              <Reveal
                as="li"
                key={item.id}
                delay={Math.min(i, 4) * 0.06}
                className="relative pl-8 md:pl-0"
              >
                {/* Dot marker, anchored to the line. */}
                <span
                  aria-hidden
                  className="absolute left-0 top-6 h-3.5 w-3.5 rounded-full border-2 border-amber bg-base md:left-1/2 md:-translate-x-1/2"
                />

                <div
                  className={
                    onLeft
                      ? "md:w-[calc(50%-2rem)] md:pr-2"
                      : "md:ml-auto md:w-[calc(50%-2rem)] md:pl-2"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(item.id)}
                    aria-haspopup="dialog"
                    className="glow-card w-full p-5 text-left"
                  >
                    <h3 className="display-title text-2xl leading-tight text-ink">{item.role}</h3>
                    <p className="mt-1 text-sm text-ink/80">{item.org}</p>
                    <MetaRow period={item.period} location={item.location} className="mt-3" />
                    {/* Clamped so the card stays a teaser even if the summary
                        is long — the popup is where the full text lives. */}
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">
                      {summarize(item)}
                    </p>
                    <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                      Full detail →
                    </span>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>

      <Modal
        open={Boolean(active)}
        onClose={() => setOpenId(null)}
        title={active?.role ?? ""}
        eyebrow={<p className="label-mono text-amber">{active?.org}</p>}
      >
        {active ? (
          <div className="space-y-6">
            <MetaRow period={active.period} location={active.location} />

            {active.image ? (
              <Frame src={active.image} alt={active.org} ratio="16/9" tone={false} className="rounded-md" />
            ) : null}

            {/* The full description — deliberately the long field, never `summary`. */}
            {active.description ? (
              <div className="space-y-4 text-sm leading-relaxed text-ink/90">
                {active.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : null}

            {(active.achievements ?? []).length > 0 ? (
              <div>
                <p className="label-mono text-amber">What came out of it</p>
                <ul className="mt-3 space-y-2">
                  {(active.achievements ?? []).map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink/85">
                      <span aria-hidden className="text-amber">
                        —
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* `stack` arrives with the v5 migration — until then the column
                is absent and reads as undefined, so never index it directly. */}
            {(active.stack ?? []).length > 0 ? (
              <div>
                <p className="label-mono text-amber">Stack</p>
                <div className="mt-3">
                  <Chips items={active.stack ?? []} />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
