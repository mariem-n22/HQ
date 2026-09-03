import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { WorkArchive } from "@/components/hq/architecture/WorkArchive";
import type { ArchiveEntry } from "@/components/hq/architecture/ArchiveCard";
import { getProjects, mediaByCategory } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Selected Projects",
  description: "Architecture projects by Mariem Nasser Elsbelgy — studio work, competition entries and freelance commissions, presented as drawings and written project statements.",
  path: "/work",
});

export default async function WorkPage() {
  const projects = await getProjects();

  // The card cover prefers a HERO media row (which carries real dimensions, so
  // the card can lay out to the photograph's own shape) and falls back to the
  // legacy flat `coverImage` string, which has no dimensions and therefore
  // takes the card's default ratio.
  const entries: ArchiveEntry[] = projects.map((project) => {
    const byCategory = mediaByCategory(project.media);
    const hero = byCategory.HERO[0] ?? byCategory.GALLERY[0] ?? null;
    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      location: project.location,
      year: project.year,
      status: project.status,
      typology: project.typology,
      cover: hero ?? (project.coverImage ? { url: project.coverImage, kind: "IMAGE" } : null),
    };
  });

  return (
    <SectorPage>
      <SectorHeader
        sector="02"
        label="Work"
        title="Selected projects"
        intro="An archive of built, unbuilt and ongoing work."
      />
      <div className="mt-10">
        {entries.length === 0 ? <EmptyState what="projects" /> : <WorkArchive entries={entries} />}
      </div>
    </SectorPage>
  );
}