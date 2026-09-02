import Link from "next/link";
import { SiteShell } from "@/components/hq/SiteShell";
import { ProjectCard } from "@/components/hq/ProjectCard";
import { Frame } from "@/components/hq/Frame";
import { Reveal } from "@/components/hq/Reveal";
import { getContentBlocks, getNavPresence, getProjects, getSettings, findBlock, SECTORS } from "@/lib/data";
import { JsonLd } from "@/components/JsonLd";
import {
  ONE_LINER, STUDIO, SITE_URL, absolute, graph, studioSchema, pageMeta,
} from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...pageMeta({
    title: `${STUDIO.name} — selected projects`,
    description: ONE_LINER,
    path: "/",
    type: "profile",
  }),
  // The home page owns the bare name, so it must not inherit the "| Name"
  // template that every other page uses.
  title: { absolute: `${STUDIO.name} — selected projects` },
};

export default async function HomePage() {
  const [projects, blocks, settings, navPresent] = await Promise.all([
    getProjects(),
    getContentBlocks(),
    getSettings(), getNavPresence()]);

  const intro = findBlock(blocks, "home_intro");
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const secondary = projects.filter((p) => p.id !== featured?.id).slice(0, 4);

  return (
    <SiteShell>
      {/* One entity: the studio. The previous graph asserted a person, two
          companies and an open-source project, none of which describe this
          site any more. */}
      <JsonLd
        data={graph(
          {
            "@type": "WebSite",
            "@id": absolute("/#website"),
            url: SITE_URL,
            name: STUDIO.name,
            description: ONE_LINER,
            inLanguage: "en",
            publisher: { "@id": absolute("/#studio") },
          },
          studioSchema(),
        )}
      />
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <header className="carbon -mx-6 px-6 py-10 sm:-mx-8 sm:px-8">
          <p className="label-mono text-amber">
            {STUDIO.discipline}{settings?.location ? ` — ${settings.location}` : ""}
          </p>
          <h1 className="display-title mt-5 max-w-4xl text-5xl leading-[1.05] text-ink sm:text-7xl">
            {intro?.title || "Selected work from the studio."}
          </h1>
          <p className="standfirst mt-6 max-w-2xl text-[17px]">
            {intro?.body ||
              "An archive of built, unbuilt and ongoing projects. Set the studio's own introduction from the dashboard."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/portfolio"
              className="rounded-sm border border-ink bg-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-base transition-opacity hover:opacity-90"
            >
              The portfolio
            </Link>
            <Link
              href="/contact"
              className="rounded-sm border border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:border-amber hover:text-amber"
            >
              Get in touch
            </Link>
          </div>
        </header>

        {featured ? (
          <Reveal as="section" className="mt-16">
            <h2 className="label-mono text-amber">Cover story</h2>
            <Link
              href={`/work/${featured.slug}`}
              className="glow-card mt-6 grid gap-0 overflow-hidden md:grid-cols-2"
            >
              <Frame
                src={featured.coverImage}
                alt={`${featured.title} cover`}
                ratio="4/3"
                tone={false}
                className="rounded-l-3xl border-0 md:border-r md:border-line"
              />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <span className="data-mono text-[11px] tracking-widest">
                  {featured.year} · {featured.status}
                </span>
                <h3 className="display-title mt-2 text-3xl text-ink sm:text-4xl">
                  {featured.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{featured.tagline}</p>
                <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                  Open case study →
                </span>
              </div>
            </Link>
          </Reveal>
        ) : null}

        {secondary.length > 0 ? (
          <Reveal as="section" className="mt-16">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="label-mono text-amber">Also on the grid</h2>
              <Link href="/work" className="link-underline label-mono text-ink">
                All work
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {secondary.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Reveal>
        ) : null}

        <Reveal as="section" className="mt-16">
          <h2 className="label-mono text-amber">Contents</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* The contents grid is navigation too, so it follows the same
                rule as the header: a sector with nothing behind it is not
                advertised as a destination. */}
            {SECTORS.filter((sector) => navPresent[sector.to] !== false).map((sector) => (
              <Link key={sector.to} href={sector.to} className="glow-card p-5">
                <p className="data-mono text-[11px] tracking-widest">{sector.code}</p>
                <h3 className="display-title mt-2 text-2xl text-ink">{sector.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{sector.blurb}</p>
              </Link>
            ))}
          </div>
        </Reveal>

        {settings?.philosophyQuote ? (
          <Reveal as="section" className="mt-20 border-t border-line pt-12">
            <blockquote className="display-title max-w-3xl text-2xl leading-snug text-ink sm:text-3xl">
              “{settings.philosophyQuote}”
            </blockquote>
          </Reveal>
        ) : null}
      </div>
    </SiteShell>
  );
}
