import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { SectorPage } from "@/components/hq/SiteShell";
import { MediaFigure } from "@/components/hq/architecture/MediaFigure";
import { getArchitectProfile, getPhilosophy } from "@/lib/data";
import { parseStage } from "@/lib/types";

export const metadata: Metadata = pageMeta({
  title: "About",
  description: "The architect behind the practice — background, training, work and recognition.",
  path: "/studio/architect",
});

/** "Name — 2024" / "Title — https://…" → the two halves, either may be blank. */
function splitEntry(line: string) {
  const { label, year } = parseStage(line);
  return { label, tail: year };
}

function Section({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <section className="border-t border-line pt-8">
      <h2 className="label-mono text-amber">{title}</h2>
      <div className="mt-4 max-w-2xl space-y-5 text-base leading-relaxed text-ink/90">
        {body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </section>
  );
}

/**
 * About — the practice's single biography page.
 *
 * This absorbed the earlier, thinner "The Architect" page rather than sitting
 * alongside it: the structure here is a strict superset of that one, and two
 * biography pages would have been the redundancy that page's brief warned
 * against. The route is unchanged so the nav entry, sitemap, revalidation and
 * nav-presence checks all keep working.
 *
 * The philosophy section is an excerpt with a link, not a copy. The text is
 * read from the Philosophy singleton — the same record the standalone page
 * renders — so there is exactly one source and no way for the two to drift.
 *
 * Nothing is invented: each section is omitted entirely when empty, and a
 * profile with no content at all shows one honest empty state.
 */
export default async function AboutPage() {
  const [profile, philosophy] = await Promise.all([getArchitectProfile(), getPhilosophy()]);

  const sections = [
    { title: "Early years", body: profile?.earlyYears ?? "" },
    { title: "Education", body: profile?.education ?? "" },
    { title: "Career", body: profile?.career ?? "" },
    { title: "Founding the practice", body: profile?.foundingPractice ?? "" },
  ].filter((s) => s.body.trim());

  const later = [
    { title: "Major milestones", body: profile?.milestones ?? "" },
    { title: "Currently", body: profile?.currently ?? "" },
  ].filter((s) => s.body.trim());

  const awards = (profile?.awards ?? []).filter((a) => a.trim());
  const publications = (profile?.publications ?? []).filter((p) => p.trim());
  const credentials = (profile?.credentials ?? []).filter((c) => c.trim());

  // The excerpt prefers a purpose-written note, and otherwise takes the
  // opening of the Philosophy statement itself.
  const philosophyFull = (philosophy?.statement ?? "").trim();
  const philosophyExcerpt = (profile?.philosophyNote ?? "").trim() || philosophyFull;

  const hasAnything =
    Boolean(profile?.name?.trim() || profile?.biography?.trim() || profile?.portrait?.trim()) ||
    sections.length > 0 ||
    later.length > 0 ||
    awards.length > 0 ||
    publications.length > 0;

  return (
    <SectorPage>
      <p className="label-mono text-amber">Studio</p>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.7fr]">
        <div>
          <MediaFigure
            item={{ url: profile?.portrait ?? "", kind: "IMAGE" }}
            fallbackRatio="4 / 5"
            priority
            className="border border-line"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          {credentials.length > 0 ? (
            <div className="mt-6">
              <p className="label-mono text-amber">Credentials</p>
              <ul className="mt-3 space-y-1.5">
                {credentials.map((line, i) => (
                  <li key={i} className="text-sm text-mute">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div>
          <h1 className="display-title text-5xl text-ink sm:text-6xl">
            {profile?.name?.trim() || "About"}
          </h1>
          {profile?.roleLine?.trim() ? (
            <p className="label-mono mt-4">{profile.roleLine}</p>
          ) : null}

          {profile?.biography?.trim() ? (
            <div className="standfirst mt-8 max-w-2xl space-y-5 text-[17px]">
              {profile.biography.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}

          {!hasAnything ? (
            <div className="mt-8 border border-dashed border-line bg-surface p-6">
              <p className="text-sm text-mute">
                This page has not been written yet. Add the portrait, name and biography sections
                under <span className="text-ink">Dashboard → About</span>.
              </p>
            </div>
          ) : null}

          {sections.length > 0 ? (
            <div className="mt-12 space-y-10">
              {sections.map((s) => (
                <Section key={s.title} title={s.title} body={s.body} />
              ))}
            </div>
          ) : null}

          {/* Architectural philosophy — excerpt, pointing at the full page. */}
          {philosophyExcerpt ? (
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="label-mono text-amber">Architectural philosophy</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/90">
                {philosophyExcerpt}
              </p>
              {philosophyFull ? (
                <Link
                  href="/studio/philosophy"
                  className="mt-4 inline-flex items-center gap-2 text-[13px] text-amber"
                >
                  Read the full philosophy
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ) : null}
            </section>
          ) : null}

          {later.length > 0 ? (
            <div className="mt-10 space-y-10">
              {later.map((s) => (
                <Section key={s.title} title={s.title} body={s.body} />
              ))}
            </div>
          ) : null}

          {awards.length > 0 ? (
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="label-mono text-amber">Awards</h2>
              <ul className="mt-4 space-y-2.5">
                {awards.map((line, i) => {
                  const { label, tail } = splitEntry(line);
                  return (
                    <li key={i} className="flex flex-wrap items-baseline gap-x-4">
                      <span className="text-sm text-ink">{label}</span>
                      {tail ? <span className="data-mono text-[11px]">{tail}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {publications.length > 0 ? (
            <section className="mt-10 border-t border-line pt-8">
              <h2 className="label-mono text-amber">Publications</h2>
              <ul className="mt-4 space-y-2.5">
                {publications.map((line, i) => {
                  const { label, tail } = splitEntry(line);
                  const isUrl = /^https?:\/\//i.test(tail);
                  return (
                    <li key={i} className="text-sm text-ink">
                      {isUrl ? (
                        <a
                          href={tail}
                          target="_blank"
                          rel="noreferrer"
                          className="link-underline hover:text-amber"
                        >
                          {label} ↗
                        </a>
                      ) : (
                        <span>
                          {label}
                          {tail ? <span className="ml-3 data-mono text-[11px]">{tail}</span> : null}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {/*
        Only "The Work" here. An "Explore the Practice" link was drafted
        alongside it, but there is no practice/studio page for it to point at —
        the nav's "Practice" entry is the /skills page, which is a different
        thing entirely. Rather than send people somewhere that does not answer
        the promise, the link is omitted until such a page exists.
      */}
      <nav aria-label="Continue" className="mt-20 border border-line">
        <Link href="/work" className="group block bg-base p-8 transition-colors hover:bg-surface">
          <p className="label-mono">Explore</p>
          <p className="display-title mt-2 flex items-center gap-3 text-3xl text-ink group-hover:text-amber">
            The Work
            <ArrowRight
              aria-hidden
              className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transform-none"
            />
          </p>
        </Link>
      </nav>

    </SectorPage>
  );
}
