"use client";

import { useState } from "react";
import type { Book } from "@/lib/types";
import { Frame } from "./Frame";
import { Reveal } from "./Reveal";
import { Modal } from "./Modal";

/**
 * Reading log. Cards open the same accessible Modal the Experience and
 * Identity sections use, so the interaction is one pattern across the site.
 *
 * Highlights render as pulled quotes with a left accent rule, deliberately
 * distinct from the takeaway prose beneath them — the two are different kinds
 * of writing and shouldn't look alike.
 */
export function BookShelf({ books }: { books: Book[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = books.find((b) => b.id === openId) ?? null;

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <Reveal as="li" key={book.id} delay={Math.min(i, 5) * 0.06} className="h-full">
            <button
              type="button"
              onClick={() => setOpenId(book.id)}
              aria-haspopup="dialog"
              className="glow-card flex h-full w-full flex-col overflow-hidden text-left"
            >
              <Frame
                src={book.coverImage}
                alt={`${book.title} cover`}
                ratio="4/3"
                tone={false}
                className="rounded-t-3xl border-0 border-b border-line"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="display-title text-2xl leading-tight text-cyan">{book.title}</h3>
                  {book.status === "READING" ? (
                    <span className="shrink-0 rounded-sm border border-go/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-go">
                      Reading
                    </span>
                  ) : null}
                </div>
                {book.author ? <p className="mt-1 text-sm text-ink/80">{book.author}</p> : null}
                <p className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                  {book.highlights.length > 0
                    ? `${book.highlights.length} highlight${book.highlights.length === 1 ? "" : "s"} →`
                    : "Open →"}
                </p>
              </div>
            </button>
          </Reveal>
        ))}
      </ul>

      <Modal
        open={Boolean(active)}
        onClose={() => setOpenId(null)}
        title={active?.title ?? ""}
        eyebrow={<p className="label-mono text-amber">{active?.author}</p>}
      >
        {active ? (
          <div className="space-y-8">
            {active.highlights.length > 0 ? (
              <section>
                <p className="label-mono text-amber">Highlights</p>
                <ul className="mt-4 space-y-4">
                  {active.highlights.map((line, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-cyan/60 pl-4 text-sm italic leading-relaxed text-ink/90"
                    >
                      &ldquo;{line}&rdquo;
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {active.takeaway ? (
              <section className="border-t border-line pt-6">
                <p className="label-mono text-amber">What I took from it</p>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/90">
                  {active.takeaway.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {active.highlights.length === 0 && !active.takeaway ? (
              <p className="text-sm text-mute">Nothing written up for this one yet.</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
