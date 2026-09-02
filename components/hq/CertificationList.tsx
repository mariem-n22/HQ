"use client";

import { useState } from "react";
import type { Certification } from "@/lib/types";
import { Frame } from "./Frame";
import { Modal } from "./Modal";
import { Reveal } from "./Reveal";

/**
 * Certifications, opening into the same popup Experience uses.
 *
 * Previously the whole card was an outbound link to the verification page,
 * which meant the certificate itself was never shown at any useful size and
 * the card had exactly one possible action. Now the card opens the shared
 * Modal — same component, same focus trap, same Escape handling as the
 * Experience timeline — and the verification link lives inside the popup, so
 * the card is not two competing targets.
 */
export function CertificationList({ certifications }: { certifications: Certification[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = certifications.find((c) => c.id === openId) ?? null;

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert, i) => (
          <Reveal as="li" key={cert.id} delay={Math.min(i, 5) * 0.06} className="h-full">
            <button
              type="button"
              onClick={() => setOpenId(cert.id)}
              aria-haspopup="dialog"
              className="glow-card flex h-full w-full flex-col overflow-hidden text-left"
            >
              <Frame
                src={cert.image}
                alt={`${cert.title} certificate`}
                ratio="16/9"
                tone={false}
                className="rounded-t-3xl border-0 border-b border-line"
              />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="display-title text-xl leading-tight text-ink">{cert.title}</h2>
                {cert.issuer ? <p className="mt-1 text-sm text-ink/80">{cert.issuer}</p> : null}
                {cert.date ? (
                  <p className="data-mono mt-2 text-[11px] tracking-widest">{cert.date}</p>
                ) : null}
                <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                  Full detail →
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </ul>

      <Modal
        open={Boolean(active)}
        onClose={() => setOpenId(null)}
        title={active?.title ?? ""}
        eyebrow={active?.issuer ? <p className="label-mono text-amber">{active.issuer}</p> : null}
      >
        {active ? (
          <div className="space-y-6">
            {active.image ? (
              <Frame
                src={active.image}
                alt={`${active.title} certificate`}
                ratio="16/9"
                tone={false}
                className="rounded-sm"
              />
            ) : null}

            {active.date ? (
              <div>
                <p className="label-mono">Issued</p>
                <p className="mt-1 text-sm text-ink">{active.date}</p>
              </div>
            ) : null}

            {active.sourceUrl ? (
              <a
                href={active.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border border-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-base"
              >
                Verify ↗
              </a>
            ) : (
              <p className="text-sm text-mute">No verification link on file.</p>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
