import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { ExperienceList } from "@/components/hq/ExperienceList";
import { getContentBlocks, getExperiences, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Story — how Mahmoud Hammad got here",
  description: "The narrative behind the projects: how Mahmoud Hammad went from Upper Egypt to building AI products in Cairo, plus the full track record.",
  path: "/story",
});

export default async function StoryPage() {
  const [blocks, experiences] = await Promise.all([getContentBlocks(), getExperiences()]);
  const block = findBlock(blocks, "story");

  return (
    <SectorPage>
      <SectorHeader sector="01" label="Story" title={block?.title ?? "Story"} />
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
