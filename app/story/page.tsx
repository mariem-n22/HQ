import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { ExperienceList } from "@/components/hq/ExperienceList";
import { getContentBlocks, getExperiences, getSettings, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Experience",
  description: "How Mariem Nasser Elsbelgy came to architecture, and the studies, competitions and projects since.",
  path: "/story",
});

export default async function StoryPage() {
  const [blocks, experiences, settings] = await Promise.all([
    getContentBlocks(),
    getExperiences(),
    getSettings(),
  ]);
  const block = findBlock(blocks, "story");

  return (
    <SectorPage>
      <SectorHeader sector="01" label="Story" title={block?.title ?? "Experience"} />
      {settings?.cvUrl ? (
        <a
          href="/cv"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-sm border border-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-base"
        >
          Download CV
        </a>
      ) : null}
      <div className="mt-10 max-w-2xl space-y-5 text-base leading-relaxed text-ink/90">
        {(block?.body ?? "").split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="label-mono text-amber">Track record</h2>
        {experiences.length === 0 ? (
          <div className="mt-4">
            <EmptyState what="experience entries" />
          </div>
        ) : (
          <div className="mt-6">
            <ExperienceList experiences={experiences} />
          </div>
        )}
      </div>
    </SectorPage>
  );
}
