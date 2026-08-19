import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { ProjectCard } from "@/components/hq/ProjectCard";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Work — every project by Mahmoud Hammad",
  description: "Every product Mahmoud Hammad has shipped or is building, including T1Dub and the open-source voice cloning model DeepClone.",
  path: "/work",
});

export default async function WorkPage() {
  // Every project, regardless of the portfolio flag — that flag only gates /portfolio.
  const projects = await getProjects();

  return (
    <SectorPage>
      <SectorHeader
        sector="02"
        label="Work"
        title="The grid"
        intro="Everything I've built that's worth showing, shipped or still on track."
      />
      <div className="mt-10">
        {projects.length === 0 ? (
          <EmptyState what="projects" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </SectorPage>
  );
}
