import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { Reveal } from "@/components/hq/Reveal";
import { Frame } from "@/components/hq/Frame";
import { getAchievements } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Achievements",
  description: "Competitions, awards and recognition, and the work behind each.",
  path: "/achievements",
});

/**
 * Achievements index.
 *
 * Cards link to a full page rather than opening a popup: an achievement
 * carries two galleries and a written description, which is more than a modal
 * should hold. Certifications and Now keep popups because each is a few lines.
 */
export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <SectorPage>
      <SectorHeader
        sector="10"
        label="Achievements"
        title="Recognition"
        intro="Competitions and awards, with the submitted work and the events themselves."
      />
      <div className="mt-10">
        {achievements.length === 0 ? (
          <EmptyState what="achievements" />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((item, i) => (
              <Reveal as="li" key={item.id} delay={Math.min(i, 5) * 0.06} className="h-full">
                <Link
                  href={`/achievements/${item.slug}`}
                  className="glow-card flex h-full flex-col overflow-hidden"
                >
                  <Frame
                    src={item.image}
                    alt={item.title}
                    ratio="16/9"
                    tone={false}
                    className="rounded-t-3xl border-0 border-b border-line"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      {item.category ? (
                        <span className="label-mono text-amber">{item.category}</span>
                      ) : null}
                      {item.date ? (
                        <span className="data-mono text-[11px] tracking-widest">{item.date}</span>
                      ) : null}
                    </div>
                    <h2 className="display-title mt-2 text-2xl leading-tight text-ink">
                      {item.title}
                    </h2>
                    {item.location ? (
                      <p className="mt-1 text-sm text-mute">{item.location}</p>
                    ) : null}
                    <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                      Full detail →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </SectorPage>
  );
}
