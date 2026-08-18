import Link from "next/link";
import { notFound } from "next/navigation";
import { SectorPage } from "@/components/hq/SiteShell";
import { Frame } from "@/components/hq/Frame";
import { Gallery } from "@/components/hq/Gallery";
import { getProject, getProjects, projectLinks, galleryOf } from "@/lib/data";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found — Mahmoud HQ" };
  return {
    title: `${project.title} — Work — Mahmoud HQ`,
    description: project.tagline,
    openGraph: { title: project.title, description: project.tagline },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const links = Object.entries(projectLinks(project)).filter(([, url]) => Boolean(url));
  const gallery = galleryOf(project.images);

  const meta = [
    { label: "Role", value: project.role },
    { label: "Company", value: project.company },
    { label: "Timeframe", value: project.period || project.year },
    { label: "Location", value: project.location },
    { label: "Status", value: project.status },
  ].filter((m) => m.value);

  return (
    <SectorPage>
      <Link
        href="/work"
        className="link-underline font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:text-amber"
      >
        ← Back to work
      </Link>

      <header className="mt-8">
        <span aria-hidden className="text-3xl">{project.emoji}</span>
        <p className="label-mono mt-3 text-amber">{project.status}</p>
        <h1 className="display-title mt-2 text-5xl text-ink sm:text-6xl">{project.title}</h1>
        <p className="standfirst mt-4 max-w-2xl text-[17px]">{project.tagline}</p>
      </header>

      <Frame
        src={project.coverImage}
        alt={`${project.title} cover`}
        ratio="16/9"
        priority
        className="mt-10 rounded-md"
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {meta.map((m) => (
          <div key={m.label} className="glow-card px-4 py-4">
            <dt className="label-mono">{m.label}</dt>
            <dd className="mt-2 text-sm text-ink">{m.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5 text-base leading-relaxed text-ink/90">
          {project.description.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <aside className="space-y-8">
          {project.stack.length > 0 ? (
            <div>
              <p className="label-mono text-amber">Stack</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-sm border border-line bg-raised/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mute"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {links.length > 0 ? (
            <div>
              <p className="label-mono text-amber">Links</p>
              <ul className="mt-3 space-y-2">
                {links.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="link-underline font-mono text-[11px] uppercase tracking-[0.2em] text-cyan"
                    >
                      {key} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {gallery.length > 0 ? (
        <div className="mt-16">
          <Gallery images={gallery} label="Gallery" />
        </div>
      ) : null}
    </SectorPage>
  );
}
