import type { Metadata } from "next";
import { graph, pageMeta, personSchema, t1dubSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { Frame } from "@/components/hq/Frame";
import { HeroGallery } from "@/components/hq/HeroGallery";
import { FileText } from "lucide-react";
import { Reveal } from "@/components/hq/Reveal";
import { Slider } from "@/components/hq/Slider";
import { SkillStack } from "@/components/hq/SkillStack";
import { ExperienceList } from "@/components/hq/ExperienceList";
import { SocialLinks, ContactChannels } from "@/components/hq/SocialLinks";
import {
  getAchievements,
  getContentBlocks,
  getExperiences,
  getProjects,
  getSettings,
  getSkills,
  getHeroImages,
  findBlock,
  parsePairs,
} from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Portfolio — full-stack engineer and founder",
  description: "Mahmoud Hammad: Egyptian full-stack engineer and founder of T1Dub. Selected work, technical stack, experience and achievements on one page.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const [projects, skills, experiences, achievements, settings, blocks, heroImages] =
    await Promise.all([
      getProjects(),
      getSkills(),
      getExperiences(),
      getAchievements(),
      getSettings(),
      getContentBlocks(),
      getHeroImages(),
    ]);

  const resumeProjects = projects.filter((p) => p.showOnPortfolio);
  const pitch = findBlock(blocks, "portfolio_pitch");
  const about = findBlock(blocks, "portfolio_about");
  const focus = parsePairs(findBlock(blocks, "portfolio_focus")?.body);
  const shipped = projects.filter((p) => p.status === "SHIPPED").length;

  const stats = [
    { label: "Projects shipped", value: String(shipped) },
    { label: "Technologies", value: String(skills.length) },
    { label: "Roles held", value: String(experiences.length) },
    { label: "Awards & talks", value: String(achievements.length) },
  ];

  return (
    <div className="min-h-screen bg-base">
      <JsonLd data={graph(personSchema(), t1dubSchema())} />
      {/* The portfolio carries its own header with the primary actions. */}
      <div className="sticky top-0 z-40 border-b border-line bg-base/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <p className="display-title mr-auto text-xl text-ink">
            Mahmoud
            <span className="ml-1 align-super font-mono text-[9px] uppercase tracking-[0.3em] text-amber">
              Portfolio
            </span>
          </p>
          <SocialLinks settings={settings} size="sm" />
          <div className="flex gap-2">
            <Link
              href="/contact"
              className="rounded-sm border border-amber bg-amber px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-base transition-opacity hover:opacity-90"
            >
              Contact
            </Link>
            {/* Hidden entirely when no CV is published — no dead button. */}
            {settings?.cvUrl ? (
              <a
                href="/cv"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-cyan px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan transition-colors hover:bg-cyan hover:text-base"
              >
                <FileText aria-hidden className="h-3 w-3" />
                CV
              </a>
            ) : null}
            <Link
              href="/"
              className="rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:border-amber hover:text-amber"
            >
              Full site
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <header className="border-b border-line pb-10">
          <p className="label-mono text-amber">
            Full-stack engineer &amp; founder — {settings?.location || "Cairo, EG"}
          </p>
          <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="display-title text-5xl text-ink sm:text-7xl">
                {pitch?.title || "Mahmoud"}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-mute">
                {pitch?.body ||
                  "I build and ship full-stack products end to end — Python, Django and FastAPI on the backend, React, Next.js and TypeScript on the front."}
              </p>
              {settings?.openToOpportunities ? (
                <p className="mt-5 inline-flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-go">
                  <span aria-hidden className="pulse-pip h-1.5 w-1.5 rounded-full bg-go" />
                  {settings.availability || "Open to opportunities"}
                </p>
              ) : null}
            </div>
            <HeroGallery
              images={
                heroImages.length > 0
                  ? heroImages.map((h) => ({ url: h.url, caption: h.caption, alt: h.alt }))
                  : settings?.avatarImage
                    ? [{ url: settings.avatarImage, caption: "", alt: "Portrait of Mahmoud Hammad" }]
                    : []
              }
              className="w-40 shrink-0 sm:w-48"
            />
          </div>
        </header>

        <Reveal as="section" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glow-card px-4 py-5">
              <p className="display-title text-3xl text-ink">{stat.value}</p>
              <p className="label-mono mt-2">{stat.label}</p>
            </div>
          ))}
        </Reveal>

        {about?.body ? (
          <Reveal as="section" className="mt-14">
            <h2 className="label-mono text-amber">{about.title || "About"}</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/90">
              {about.body.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>
        ) : null}

        {focus.length > 0 ? (
          <Reveal as="section" className="mt-14">
            <h2 className="label-mono text-amber">What I do</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {focus.map((item) => (
                <div key={item.title} className="glow-card p-5">
                  <h3 className="text-base font-medium text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}

        {/* Horizontal rail; every card links to the real detail page. */}
        <Reveal as="section" className="mt-12">
          <Slider label="Selected work">
            {resumeProjects.map((project) => (
              <Link
                key={project.id}
                href={`/work/${project.slug}`}
                className="glow-card flex w-[78%] shrink-0 snap-start flex-col overflow-hidden sm:w-[42%]"
              >
                <Frame
                  src={project.coverImage}
                  alt={`${project.title} cover`}
                  ratio="16/9"
                  tone={false}
                  className="rounded-t-3xl border-0 border-b border-line"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="display-title text-2xl text-cyan">{project.title}</h3>
                    <span className="data-mono text-[11px] tracking-widest">
                      {project.year} · {project.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-mute">{project.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/85">
                    {project.description.split("\n\n")[0]}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-sm border border-line bg-raised/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mute"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                    Open case study →
                  </span>
                </div>
              </Link>
            ))}
          </Slider>
        </Reveal>

        <Reveal as="section" className="mt-12">
          <h2 className="label-mono text-amber">Experience</h2>
          <div className="mt-6">
            <ExperienceList experiences={experiences} />
          </div>
        </Reveal>

        {/* Its own block after Experience ends and before Achievements begins.
            Wider margins than a normal section (mt-20/mb-20 vs mt-12) plus a
            hairline rule top and bottom, so it reads as a separate moment
            rather than the tail of one section or the head of the next.
            Hidden entirely when no CV is published — same rule as the header
            button, and the two are independent of each other. */}
        {settings?.cvUrl ? (
          <Reveal as="section" className="mb-20 mt-20">
            <span aria-hidden className="kerb block" />
            <div className="flex flex-col items-center gap-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="max-w-md">
                <p className="label-mono text-amber">Full CV</p>
                <p className="display-title mt-2 text-2xl text-ink">
                  The whole record, on paper
                </p>
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  Roles, education and the technical detail behind everything above — one PDF.
                </p>
              </div>
              <a
                href="/cv"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-cyan bg-cyan px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-base transition-opacity hover:opacity-90"
              >
                <FileText aria-hidden className="h-3.5 w-3.5" />
                Download CV
              </a>
            </div>
            <span aria-hidden className="kerb block" />
          </Reveal>
        ) : null}

        {achievements.length > 0 ? (
          <Reveal as="section" className="mt-12">
            <h2 className="label-mono text-amber">Achievements</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {achievements.map((item) => (
                <li key={item.id} className="glow-card flex flex-col overflow-hidden">
                  <Frame
                    src={item.image}
                    alt={item.title}
                    ratio="16/9"
                    tone={false}
                    className="rounded-t-3xl border-0 border-b border-line"
                  />
                  <div className="p-5">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-base font-medium text-ink">{item.title}</h3>
                      <span className="data-mono text-[11px] tracking-widest">{item.date}</span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
                      {item.category}
                      {item.location ? ` · ${item.location}` : ""}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-mute">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        <Reveal as="section" className="mt-12">
          <h2 className="label-mono text-amber">Stack</h2>
          <SkillStack skills={skills} className="mt-6" />
        </Reveal>

        <section className="mt-14 border-t border-line pt-8">
          <h2 className="display-title text-3xl text-ink">Get in touch</h2>
          <p className="mt-2 text-sm text-mute">
            Open to full-time roles, freelance builds and founder conversations.
          </p>
          <div className="mt-6">
            <ContactChannels settings={settings} />
          </div>
        </section>
      </div>
    </div>
  );
}
