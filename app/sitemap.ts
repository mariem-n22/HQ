import type { MetadataRoute } from "next";
import { getProjects, getNavPresence } from "@/lib/data";
import { absolute } from "@/lib/seo";

/**
 * Every public route that actually has something on it.
 *
 * This used to be a hardcoded list, and it had drifted from the site in both
 * directions: it advertised five pages that render nothing but an empty state
 * (/business, /now, /misc, /studio/architect, /studio/philosophy) while
 * omitting /certifications, which has content. Submitting an empty page for
 * indexing is worse than omitting it — it spends crawl budget to publish a
 * thin page under the site's own name.
 *
 * So the gated routes now read `getNavPresence()`, the same source the
 * navigation uses to decide what to show. One rule, one place: a section that
 * is not fit to link to in the nav is not fit to submit to a search engine
 * either, and neither list can drift from the other again.
 *
 * ALWAYS is the set with no content gate — they render something real whatever
 * the database holds — so they are listed unconditionally rather than looked
 * up and silently dropped when `getNavPresence` returns no key for them.
 */

type Entry = { path: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number };

/** Always present: these render real content regardless of the database. */
const ALWAYS: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/portfolio", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
];

/** Included only when `getNavPresence()` says the section has content. */
const GATED: Entry[] = [
  { path: "/work", changeFrequency: "weekly", priority: 0.9 },
  { path: "/studio/architect", changeFrequency: "monthly", priority: 0.8 },
  { path: "/studio/philosophy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/achievements", changeFrequency: "monthly", priority: 0.7 },
  { path: "/identity", changeFrequency: "monthly", priority: 0.6 },
  { path: "/story", changeFrequency: "monthly", priority: 0.6 },
  { path: "/skills", changeFrequency: "monthly", priority: 0.6 },
  { path: "/certifications", changeFrequency: "monthly", priority: 0.5 },
  { path: "/books", changeFrequency: "monthly", priority: 0.4 },
  { path: "/business", changeFrequency: "monthly", priority: 0.4 },
  { path: "/now", changeFrequency: "weekly", priority: 0.4 },
  { path: "/misc", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, present] = await Promise.all([getProjects(), getNavPresence()]);
  const now = new Date();

  // Unknown routes default to visible, matching the nav: on a degraded build
  // `present` is empty, and submitting the real route list is better than
  // submitting almost nothing.
  const included = [...ALWAYS, ...GATED.filter((r) => present[r.path] !== false)];

  const staticRoutes: MetadataRoute.Sitemap = included.map((r) => ({
    url: absolute(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absolute(`/work/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
