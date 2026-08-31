import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage } from "@/components/hq/SiteShell";
import { MediaFigure } from "@/components/hq/architecture/MediaFigure";
import { getArchitectProfile } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "The Architect",
  description: "The architect behind the practice — background, approach and credentials.",
  path: "/studio/architect",
});

/**
 * The Architect.
 *
 * Structure only. Every text block comes from the CMS and the page renders an
 * explicit "not written yet" state rather than placeholder prose, so nothing
 * invented can be mistaken for final copy.
 *
 * The shape follows what an about page has to do for this audience: a portrait
 * that establishes the person, a role line that says what they are, and a
 * biography short enough to be read in full while a client decides whether to
 * shortlist the practice. Two columns on desktop, portrait held to a third of
 * the width so the text column stays at a readable measure.
 */
export default async function ArchitectPage() {
  const profile = await getArchitectProfile();
  const bio = (profile?.biography ?? "").trim();
  const credentials = (profile?.credentials ?? []).filter((c) => c.trim());

  return (
    <SectorPage>
      <p className="label-mono text-amber">Studio</p>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <MediaFigure
            item={{ url: profile?.portrait ?? "", kind: "IMAGE" }}
            fallbackRatio="4 / 5"
            priority
            className="border border-line"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>

        <div>
          <h1 className="display-title text-5xl text-ink sm:text-6xl">
            {profile?.name?.trim() || "The Architect"}
          </h1>
          {profile?.roleLine?.trim() ? (
            <p className="label-mono mt-4">{profile.roleLine}</p>
          ) : null}

          {bio ? (
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-ink/90">
              {bio.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-line bg-surface p-6">
              <p className="text-sm text-mute">
                The biography has not been written yet. Add it under{" "}
                <span className="text-ink">Dashboard → The Architect</span>.
              </p>
            </div>
          )}

          {credentials.length > 0 ? (
            <div className="mt-10 border-t border-line pt-6">
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
      </div>
    </SectorPage>
  );
}
