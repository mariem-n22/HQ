import Link from "next/link";
import { SiteShell } from "@/components/hq/SiteShell";
import { ProjectCard } from "@/components/hq/ProjectCard";
import { Frame } from "@/components/hq/Frame";
import { Reveal } from "@/components/hq/Reveal";
import { HomeHero } from "@/components/hq/HomeHero";
import { SignatureStatement } from "@/components/hq/SignatureStatement";
import {
  getContentBlocks, getProjects, getSettings, findBlock,
  getArchitectProfile, getPhilosophy, getAchievements, getNowEntries,
} from "@/lib/data";
import {
  HomeArchitect, HomePractice, HomePhilosophy, HomeRecognition, HomeLatest,
} from "@/components/hq/home/HomeSections";
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
  const [projects, blocks, settings, profile, philosophy, achievements, nowEntries] =
    await Promise.all([
      getProjects(),
      getContentBlocks(),
      getSettings(),
      getArchitectProfile(),
      getPhilosophy(),
      getAchievements(),
      getNowEntries(),
    ]);

  const featured = projects.find((p) => p.featured) ?? projects[0];
  const secondary = projects.filter((p) => p.id !== featured?.id).slice(0, 4);

  return (
    <SiteShell hasHero>
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
      {/* 01 — Hero */}
      <HomeHero
        mediaUrl={settings?.homeHeroUrl}
        statement={settings?.signatureStatement}
        locations={settings?.locations}
        credit={settings?.homeHeroCredit}
      />

      {/* 02 — Signature Statement */}
      <SignatureStatement
        headline={settings?.statementHeadline}
        body={settings?.statementBody}
      />

      {/* 03 — Selected Work. Content and logic unchanged; only its position
          in the page moved. */}
      <div className="mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        {featured ? (
          <Reveal as="section">
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

        {/*
          04–08. Each hides itself when its source is empty, so the order below
          is the intended reading order and not a promise that all five render.
          With the current data, Recognition and Latest do and the other three
          wait on content.
        */}
        <HomeArchitect
          name={profile?.name}
          roleLine={profile?.roleLine}
          portrait={profile?.portrait}
          biography={profile?.biography}
        />

        <HomePractice
          headline={settings?.practiceHeadline}
          body={settings?.practiceBody}
          disciplines={settings?.practiceDisciplines}
        />

        {/* Same precedence the About page uses — one source for the text. */}
        <HomePhilosophy note={profile?.philosophyNote} statement={philosophy?.statement} />

        <HomeRecognition
          items={achievements.map((a) => ({
            slug: a.slug,
            title: a.title,
            date: a.date,
            category: a.category,
          }))}
          awards={profile?.awards}
        />

        {/* Most recent first; `active` marks the current ticker line, not
            publication, so it is not a filter here. */}
        <HomeLatest entries={nowEntries.slice(0, 3)} />
      </div>
    </SiteShell>
  );
}
