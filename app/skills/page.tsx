import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { SkillStack } from "@/components/hq/SkillStack";
import { getSkills } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Expertise",
  description: "How the studio works, and the areas it works in.",
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
        intro="The areas the studio works in, and how deep the practice runs in each."
      />
      <div className="mt-10">
        {skills.length === 0 ? <EmptyState what="skills" /> : <SkillStack skills={skills} />}
      </div>
    </SectorPage>
  );
}
