import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { SkillStack } from "@/components/hq/SkillStack";
import { getSkills } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Expertise",
  description: "The areas of architecture and design Mariem Nasser Elsbelgy works in, and how far each one runs.",
  path: "/skills",
});

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <SectorPage>
      <SectorHeader
        sector="03"
        label="Setup"
        title="Expertise"
        intro="The areas Mariem works in, and how far each one runs."
      />
      <div className="mt-10">
        {skills.length === 0 ? <EmptyState what="skills" /> : <SkillStack skills={skills} />}
      </div>
    </SectorPage>
  );
}
