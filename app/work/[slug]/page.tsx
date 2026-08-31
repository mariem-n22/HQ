import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectorPage } from "@/components/hq/SiteShell";
import { MediaFigure } from "@/components/hq/architecture/MediaFigure";
import {
  DiagramSequence,
  DrawingSet,
  MaterialPalette,
  PhotographyGallery,
} from "@/components/hq/architecture/ProjectGalleries";
import { getProject, getProjectOrder } from "@/lib/data";
import {
  STATUS_LABELS,
  TYPOLOGY_LABELS,
  embedSrc,
  mediaByCategory,
  parseStage,
  type MediaItem,
} from "@/lib/types";
import { JsonLd } from "@/components/JsonLd";
import { absolute, graph, pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const projects = await getProjectOrder();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };
  const where = [project.location, project.year].filter(Boolean).join(", ");
  return pageMeta({
    title: where ? `${project.title} — ${where}` : project.title,
    description: project.tagline || project.statement.slice(0, 200) || project.title,
    path: `/work/${project.slug}`,
    image: project.coverImage,
    type: "article",
  });
}

/** Section wrapper — every caller already guards on having something to show. */
function Band({ children, bordered = true }: { children: React.ReactNode; bordered?: boolean }) {
  return (
    <section className={`mt-20 ${bordered ? "border-t border-line pt-16" : ""}`}>{children}</section>
  );
}

function Prose({ label, body }: { label?: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <div>
      {label ? <p className="label-mono text-amber">{label}</p> : null}
      <div className={`space-y-5 text-base leading-relaxed text-ink/90 ${label ? "mt-4" : ""}`}>
        {body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, order] = await Promise.all([getProject(slug), getProjectOrder()]);
  if (!project) notFound();

  const m = mediaByCategory(project.media);

  // Hero: an embedded long-form film wins, then a HERO media row, then the
  // legacy flat coverImage. Nothing is invented when all three are absent.
  const heroEmbed = embedSrc(project.heroEmbedUrl);
  const heroItem: MediaItem | null =
    m.HERO[0] ?? (project.coverImage ? { url: project.coverImage, kind: "IMAGE" } : null);

  // Only fields carrying data become rows — no empty "Client: —".
  const facts = [
    { label: "Location", value: project.location },
    { label: "Year", value: project.period || project.year },
    {
      label: "Type",
      value: project.typology ? TYPOLOGY_LABELS[project.typology] ?? project.typology : "",
    },
    { label: "Status", value: STATUS_LABELS[project.status] ?? project.status },
    { label: "Area", value: project.area },
    { label: "Client", value: project.client },
    { label: "Collaborators", value: project.collaborators.join(", ") },
  ].filter((f) => f.value && String(f.value).trim());

  const contextFacts = [
    { label: "Orientation", value: project.orientation },
    { label: "Climate", value: project.climate },
  ].filter((f) => f.value.trim());

  const technical = [
    { label: "Structure", body: project.structuralConcept },
    { label: "Environmental strategy", body: project.environmentalStrategy },
    { label: "Lighting", body: project.lightingConcept },
    { label: "Construction detail", body: project.constructionDetail },
  ].filter((t) => t.body.trim());

  const stages = project.stages.map(parseStage).filter((s) => s.label);
  const recognition = project.recognition.filter((r) => r.trim());

  const at = order.findIndex((p) => p.slug === project.slug);
  const next = order.length > 1 ? order[(at + 1) % order.length] : null;

  return (
    <SectorPage>
      <JsonLd
        data={graph({
          "@type": "CreativeWork",
          "@id": absolute(`/work/${project.slug}#project`),
          name: project.title,
          description: project.tagline || project.statement.slice(0, 300),
          url: absolute(`/work/${project.slug}`),
          creator: { "@id": absolute("/#person") },
          ...(project.year ? { dateCreated: project.year } : {}),
          ...(project.location ? { locationCreated: project.location } : {}),
          ...(project.coverImage ? { image: project.coverImage } : {}),
        })}
      />

      <Link
        href="/work"
        className="label-mono inline-flex items-center gap-2 transition-colors hover:text-amber"
      >
        <ArrowLeft aria-hidden className="h-3 w-3" />
        Work
      </Link>

      {/* 1 — Hero */}
      <header className="mt-8">
        {project.typology ? (
          <p className="label-mono text-amber">
            {TYPOLOGY_LABELS[project.typology] ?? project.typology}
          </p>
        ) : null}
        <h1 className="display-title mt-3 text-5xl text-ink sm:text-7xl">{project.title}</h1>
        <p className="mt-4 text-[15px] text-mute">
          {[project.location, project.year].filter(Boolean).join(" · ")}
        </p>
      </header>

      {heroEmbed ? (
        <div className="mt-10 aspect-video w-full">
          <iframe
            src={heroEmbed}
            title={`${project.title} film`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border border-line"
          />
        </div>
      ) : heroItem ? (
        <div className="mt-10">
          <MediaFigure
            item={heroItem}
            fallbackRatio="16 / 9"
            priority
            className="border border-line"
            sizes="100vw"
          />
        </div>
      ) : null}

      {/* 2 — Overview */}
      {facts.length > 0 ? (
        <Band bordered={false}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="label-mono">{f.label}</dt>
                <dd className="mt-2 text-sm text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Band>
      ) : null}

      {/* 3 — Statement */}
      {project.statement.trim() ? (
        <Band>
          <div className="max-w-2xl">
            <Prose label="Statement" body={project.statement} />
          </div>
        </Band>
      ) : null}

      {project.description.trim() ? (
        <Band bordered={false}>
          <div className="max-w-2xl">
            <Prose body={project.description} />
          </div>
        </Band>
      ) : null}

      {/* 4 — Context / Site */}
      {project.siteDescription.trim() || contextFacts.length > 0 || m.SITE.length > 0 ? (
        <Band>
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <Prose label="Context" body={project.siteDescription} />
            {contextFacts.length > 0 ? (
              <dl className="space-y-5">
                {contextFacts.map((f) => (
                  <div key={f.label}>
                    <dt className="label-mono">{f.label}</dt>
                    <dd className="mt-2 text-sm text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {m.SITE.length > 0 ? (
            <div className="mt-10">
              <PhotographyGallery items={m.SITE} label="Site" />
            </div>
          ) : null}
        </Band>
      ) : null}

      {/* 5 — Concept diagrams */}
      {m.DIAGRAM.length > 0 ? (
        <Band>
          <DiagramSequence items={m.DIAGRAM} />
        </Band>
      ) : null}

      {/* 6 — Drawings */}
      {m.PLAN.length + m.SECTION.length + m.ELEVATION.length > 0 ? (
        <Band>
          <DrawingSet
            groups={[
              { label: "Plans", items: m.PLAN },
              { label: "Sections", items: m.SECTION },
              { label: "Elevations", items: m.ELEVATION },
            ]}
          />
        </Band>
      ) : null}

      {/* 7 — Materials */}
      {m.MATERIAL.length > 0 ? (
        <Band>
          <MaterialPalette items={m.MATERIAL} />
        </Band>
      ) : null}

      {/* 8 — Technical layer */}
      {technical.length > 0 || m.CONSTRUCTION.length > 0 ? (
        <Band>
          <p className="label-mono text-amber">Technical</p>
          {technical.length > 0 ? (
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              {technical.map((t) => (
                <div key={t.label}>
                  <h3 className="display-title text-xl text-ink">{t.label}</h3>
                  <div className="mt-3 space-y-4 text-sm leading-relaxed text-ink/90">
                    {t.body.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {m.CONSTRUCTION.length > 0 ? (
            <div className="mt-10">
              <PhotographyGallery items={m.CONSTRUCTION} label="Construction" />
            </div>
          ) : null}
        </Band>
      ) : null}

      {/* 9 — Final photography */}
      {m.GALLERY.length > 0 ? (
        <Band>
          <PhotographyGallery items={m.GALLERY} />
        </Band>
      ) : null}

      {/* 10 — Timeline */}
      {stages.length > 0 ? (
        <Band>
          <p className="label-mono text-amber">Timeline</p>
          <ol className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {stages.map((s, i) => (
              <li key={`${s.label}-${i}`} className="bg-base p-5">
                <span className="data-mono text-[11px]">{s.year}</span>
                <p className="mt-2 text-sm text-ink">{s.label}</p>
              </li>
            ))}
          </ol>
        </Band>
      ) : null}

      {/* 11 — Recognition */}
      {recognition.length > 0 ? (
        <Band>
          <p className="label-mono text-amber">Recognised by</p>
          <ul className="mt-4 space-y-2">
            {recognition.slice(0, 3).map((line, i) => (
              <li key={i} className="text-sm text-ink/90">
                {line}
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {/* 12 — Next project */}
      {next ? (
        <section className="mt-24 border-t border-line pt-10">
          <Link href={`/work/${next.slug}`} className="group block">
            <p className="label-mono">Next project</p>
            <div className="mt-5 grid items-end gap-6 sm:grid-cols-[1.4fr_1fr]">
              <div className="overflow-hidden border border-line">
                <MediaFigure
                  item={{ url: next.coverImage ?? "", kind: "IMAGE" }}
                  fallbackRatio="21 / 9"
                  imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                  sizes="(min-width: 640px) 60vw, 100vw"
                />
              </div>
              <div>
                <h2 className="display-title text-4xl text-ink transition-colors group-hover:text-amber">
                  {next.title}
                </h2>
                <p className="mt-2 text-sm text-mute">
                  {[next.location, next.year].filter(Boolean).join(" · ")}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[13px] text-amber">
                  View project
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transform-none"
                  />
                </span>
              </div>
            </div>
          </Link>
        </section>
      ) : null}
    </SectorPage>
  );
}
