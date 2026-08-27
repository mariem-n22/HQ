import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { Frame } from "@/components/hq/Frame";
import { Reveal } from "@/components/hq/Reveal";
import { getCertifications, getContentBlocks, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Certifications — Mahmoud Hammad",
  description:
    "Credentials and certifications earned by Mahmoud Hammad, with links to verify each one.",
  path: "/certifications",
});

export default async function CertificationsPage() {
  const [certifications, blocks] = await Promise.all([getCertifications(), getContentBlocks()]);
  const block = findBlock(blocks, "certifications_intro");

  return (
    <SectorPage>
      <SectorHeader
        sector="09"
        label="Certifications"
        title={block?.title ?? "Credentials"}
        intro={block?.body ?? "Courses and certifications, each linking to where it can be verified."}
      />
      <div className="mt-10">
        {certifications.length === 0 ? (
          <EmptyState what="certifications" />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert, i) => {
              // The whole card is the link when a verification URL exists.
              const inner = (
                <>
                  <Frame
                    src={cert.image}
                    alt={`${cert.title} certificate`}
                    ratio="16/9"
                    tone={false}
                    className="rounded-t-3xl border-0 border-b border-line"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="display-title text-xl leading-tight text-cyan">{cert.title}</h2>
                    {cert.issuer ? <p className="mt-1 text-sm text-ink/80">{cert.issuer}</p> : null}
                    {cert.date ? (
                      <p className="data-mono mt-2 text-[11px] tracking-widest">{cert.date}</p>
                    ) : null}
                    {cert.sourceUrl ? (
                      <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                        Verify ↗
                      </span>
                    ) : null}
                  </div>
                </>
              );

              return (
                <Reveal as="li" key={cert.id} delay={Math.min(i, 5) * 0.06} className="h-full">
                  {cert.sourceUrl ? (
                    <a
                      href={cert.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="glow-card flex h-full flex-col overflow-hidden"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="glow-card flex h-full flex-col overflow-hidden">{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </SectorPage>
  );
}
