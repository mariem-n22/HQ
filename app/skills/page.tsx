import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { SkillStack } from "@/components/hq/SkillStack";
import { getSkills } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Technical stack",
  description: "The stack Mahmoud Hammad actually builds on — Python, Django, FastAPI, React, Next.js, TypeScript and PostgreSQL — with honest proficiency levels.",
  path: "/skills",
});

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <SectorPage>
      <SectorHeader
        sector="03"
        label="Setup"
        title="Car setup"
        intro="What I reach for, and how deep I actually am in each. No five-star ratings on things I've touched twice."
      />
      <div className="mt-10">
        {skills.length === 0 ? <EmptyState what="skills" /> : <SkillStack skills={skills} />}
      </div>
    </SectorPage>
  );
}
