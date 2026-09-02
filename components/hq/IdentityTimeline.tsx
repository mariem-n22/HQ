"use client";

import { useMemo, useState } from "react";
import type { IdentityMoment } from "@/lib/types";
import { summarize } from "@/lib/summary";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";
import { Modal } from "./Modal";

/**
 * Identity moments, presented the way the Story page presents a career: a
 * staggered timeline rather than a card grid.
 *
 * One rule down the middle with a marker per moment and cards alternating to
 * either side, collapsing to a single left-aligned column below `md` — the
 * same structure as ExperienceList, because each entry here is a distinct
 * moment in a sequence, not one tile among equals. The card keeps its image:
 * on this page the photograph is the strongest thing an entry has, which is
 * the one way this differs from the Experience version.
 *
 * The category filter follows the Work archive's rule exactly: it is built
 * from the categories actually present, and it does not render at all unless
 * there is more than one to choose between — a filter offering a single option
 * filters nothing.
 */
export function IdentityTimeline({ moments }: { moments: IdentityMoment[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const active = moments.find((moment) => moment.id === openId) ?? null;

  const categories = useMemo(() => {
    const seen = Array.from(
      new Set(moments.map((m) => (m.category ?? "").trim()).filter(Boolean)),
    );
    return seen.sort((a, b) => a.localeCompare(b));
  }, [moments]);

  const shown = useMemo(
    () => (category ? moments.filter((m) => (m.category ?? "").trim() === category) : moments),
    [moments, category],
  );

  return (
    <>
      {categories.length > 1 ? (
        <div className="border-y border-line py-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="label-mono w-20 shrink-0">Category</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {categories.map((value) => {
                const on = category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(on ? null : value)}
                    aria-pressed={on}
                    className={`min-h-[44px] py-2 text-[13px] transition-colors ${
                      on
                        ? "text-amber underline decoration-amber underline-offset-[6px]"
                        : "text-mute hover:text-ink"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p aria-live="polite" className="label-mono">
              {shown.length} {shown.length === 1 ? "moment" : "moments"}
            </p>
            {category ? (
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="min-h-[44px] text-[13px] text-mute transition-colors hover:text-amber"
              >
                Clear filter
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="mt-10 border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm text-mute">No moments in that category.</p>
        </div>
      ) : (
        <div className="relative mt-10">
          {/* The connecting line: left edge on mobile, centred from md up. */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-[7px] w-px bg-gradient-to-b from-transparent via-line to-transparent md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="space-y-6">
            {shown.map((moment, i) => {
              const onLeft = i % 2 === 0;
              return (
                <Reveal
                  as="li"
                  key={moment.id}
                  delay={Math.min(i, 4) * 0.06}
                  className="relative pl-8 md:pl-0"
                >
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
                      onClick={() => setOpenId(moment.id)}
                      aria-haspopup="dialog"
                      className="glow-card w-full overflow-hidden text-left"
                    >
                      {moment.image ? (
                        <Frame
                          src={moment.image}
                          alt={moment.title}
                          ratio="16/9"
                          tone={false}
                          className="rounded-t-3xl border-0 border-b border-line"
                        />
                      ) : null}
                      <div className="p-5">
                        <div className="flex flex-wrap items-baseline gap-3">
                          {moment.year ? (
                            <span className="data-mono text-[11px] tracking-widest">{moment.year}</span>
                          ) : null}
                          {moment.category?.trim() ? (
                            <span className="label-mono text-amber">{moment.category}</span>
                          ) : null}
                        </div>
                        <h3 className="display-title mt-1 text-2xl leading-tight text-ink">
                          {moment.title}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">
                          {summarize(moment)}
                        </p>
                        <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                          Full detail →
                        </span>
                      </div>
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      )}

      <Modal
        open={Boolean(active)}
        onClose={() => setOpenId(null)}
        title={active?.title ?? ""}
        eyebrow={
          <p className="label-mono text-amber">
            {[active?.category?.trim(), active?.year].filter(Boolean).join(" · ")}
          </p>
        }
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
