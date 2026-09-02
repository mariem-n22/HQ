import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { SectorPage } from "@/components/hq/SiteShell";
import { MediaFigure } from "@/components/hq/architecture/MediaFigure";
import { PhotographyGallery } from "@/components/hq/architecture/ProjectGalleries";
import { getAchievement, getAchievementOrder } from "@/lib/data";
import { achievementMediaSets } from "@/lib/types";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const rows = await getAchievementOrder();
  return rows.map((r) => ({ slug: r.slug })).filter((r) => r.slug);
}

/**
 * Slugs are sanitised on save, but a link written before that fix — or typed
 * by hand — can still arrive percent-encoded. Same backstop as /work/[slug].
 */
function decodeSlug(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getAchievement(decodeSlug(slug));
  if (!item) return { title: "Not found" };
  return pageMeta({
    title: item.title,
    description: item.description.slice(0, 200) || item.title,
    path: `/achievements/${item.slug}`,
    image: item.image,
    type: "article",
  });
}

export default async function AchievementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, order] = await Promise.all([getAchievement(decodeSlug(slug)), getAchievementOrder()]);
  if (!item) notFound();

  const { work, event } = achievementMediaSets(item.media);

  const facts = [
    { label: "Category", value: item.category },
    { label: "Date", value: item.date },
    { label: "Location", value: item.location },
    { label: "Role", value: item.role },
  ].filter((f) => f.value.trim());

  const at = order.findIndex((r) => r.slug === item.slug);
  const next = order.length > 1 ? order[(at + 1) % order.length] : null;

  return (
    <SectorPage>
      <Link
        href="/achievements"
        className="label-mono inline-flex items-center gap-2 transition-colors hover:text-amber"
      >
        <ArrowLeft aria-hidden className="h-3 w-3" />
        Achievements
      </Link>

      <header className="mt-8">
        {item.category ? <p className="label-mono text-amber">{item.category}</p> : null}
        <h1 className="display-title mt-3 text-5xl text-ink sm:text-6xl">{item.title}</h1>
        {item.date || item.location ? (
          <p className="mt-4 text-[15px] text-mute">
            {[item.location, item.date].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </header>

      {item.image ? (
        <div className="mt-10">
          <MediaFigure
            item={{ url: item.image, kind: "IMAGE" }}
            fallbackRatio="16 / 9"
            priority
            className="border border-line"
            sizes="100vw"
          />
        </div>
      ) : null}

      {facts.length > 0 ? (
        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="label-mono">{f.label}</dt>
              <dd className="mt-2 text-sm text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {item.description.trim() ? (
        <div className="mt-12 max-w-2xl space-y-5 text-base leading-relaxed text-ink/90">
          {item.description.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      ) : null}

      {item.tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-line bg-raised/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mute"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* The two sets, each rendered only when it has images. */}
      {work.length > 0 ? (
        <section className="mt-20 border-t border-line pt-16">
          <PhotographyGallery items={work} label="The Work" />
        </section>
      ) : null}

      {event.length > 0 ? (
        <section className="mt-20 border-t border-line pt-16">
          <PhotographyGallery items={event} label="The Event" />
        </section>
      ) : null}

      {next ? (
        <section className="mt-24 border-t border-line pt-10">
          <Link href={`/achievements/${next.slug}`} className="group block">
            <p className="label-mono">Next</p>
            <h2 className="display-title mt-3 flex items-center gap-3 text-4xl text-ink transition-colors group-hover:text-amber">
              {next.title}
              <ArrowRight
                aria-hidden
                className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </h2>
          </Link>
        </section>
      ) : null}
    </SectorPage>
  );
}
