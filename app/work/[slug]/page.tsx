import Link from "next/link";
import { notFound } from "next/navigation";
import { SectorPage } from "@/components/hq/SiteShell";
import { Frame } from "@/components/hq/Frame";
import { Gallery } from "@/components/hq/Gallery";
import { getProject, getProjects, projectLinks, galleryOf } from "@/lib/data";
import { JsonLd } from "@/components/JsonLd";
import { PERSON, absolute, graph, pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };
  return pageMeta({
    title: `${project.title} — a project by ${PERSON.name}`,
    description:
      project.tagline ||
      `${project.title}, built by ${PERSON.name}.`,
    path: `/work/${project.slug}`,
    image: project.coverImage,
    type: "article",
  });
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

  // Software projects get SoftwareSourceCode; DeepClone is explicitly flagged
  // open source, which is the citable fact for "Egyptian open-source AI" queries.
  const isOpenSource = /deepclone/i.test(project.slug);

  return (
    <SectorPage>
      <JsonLd
        data={graph({
          "@type": "SoftwareSourceCode",
          "@id": absolute(`/work/${project.slug}#project`),
          name: project.title,
          headline: project.title,
          description: project.tagline || project.description.slice(0, 300),
          url: absolute(`/work/${project.slug}`),
          author: { "@type": "Person", "@id": absolute("/#mahmoud-hammad"), name: PERSON.name },
          creator: { "@id": absolute("/#mahmoud-hammad") },
          dateCreated: project.year || undefined,
          programmingLanguage: project.stack,
          keywords: project.stack.join(", "),
          ...(project.coverImage ? { image: project.coverImage } : {}),
          ...(isOpenSource
            ? { isAccessibleForFree: true, license: "https://opensource.org/licenses/MIT" }
            : {}),
        })}
      />
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

          {/* Only rendered when filled — no empty heading. */}
          {project.outcome ? (
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="label-mono text-amber">What came out of it</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-ink/90">
                {project.outcome.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ) : null}

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
              {/* Buttons, not text links. "live" gets the filled primary
                  treatment used for CTAs elsewhere; the rest are outlined
                  secondaries so they still read as actionable at a glance. */}
              <ul className="mt-3 flex flex-wrap gap-2">
                {links.map(([key, url]) => {
                  const primary = key === "live";
                  return (
                    <li key={key}>
                      <a
                        href={url as string}
                        target="_blank"
                        rel="noreferrer"
                        className={
                          primary
                            ? "inline-flex items-center gap-1.5 rounded-sm border border-amber bg-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-base transition-opacity hover:opacity-90"
                            : "inline-flex items-center gap-1.5 rounded-sm border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-amber hover:text-amber"
                        }
                      >
                        {key === "live" ? "View live" : key === "github" ? "GitHub" : "Other"}
                        <span aria-hidden>↗</span>
                      </a>
                    </li>
                  );
                })}
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
