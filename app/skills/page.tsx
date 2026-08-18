import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { SkillStack } from "@/components/hq/SkillStack";
import { getSkills } from "@/lib/data";

export const metadata = {
  title: "Setup — Mahmoud HQ",
  description: "The stack I actually drive: Python, Django, FastAPI, React, Next.js, TypeScript, Postgres.",
};

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
