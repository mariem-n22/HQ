import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";
import { absolute } from "@/lib/seo";

/** Every public route, with project pages generated from the database. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  // `satisfies` keeps changeFrequency narrowed to the literal union that
  // MetadataRoute.Sitemap requires — a bare array widens it to string.
  const staticRoutes: MetadataRoute.Sitemap = ([
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/portfolio"), changeFrequency: "weekly", priority: 0.9 },
    { url: absolute("/identity"), changeFrequency: "monthly", priority: 0.9 },
    { url: absolute("/work"), changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/story"), changeFrequency: "monthly", priority: 0.8 },
    { url: absolute("/skills"), changeFrequency: "monthly", priority: 0.6 },
    { url: absolute("/business"), changeFrequency: "monthly", priority: 0.6 },
    { url: absolute("/now"), changeFrequency: "weekly", priority: 0.5 },
    { url: absolute("/misc"), changeFrequency: "monthly", priority: 0.4 },
    { url: absolute("/studio/architect"), changeFrequency: "monthly", priority: 0.7 },
    { url: absolute("/studio/philosophy"), changeFrequency: "monthly", priority: 0.6 },
    { url: absolute("/contact"), changeFrequency: "yearly", priority: 0.7 },
  ] satisfies MetadataRoute.Sitemap).map((entry) => ({ ...entry, lastModified: new Date() }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absolute(`/work/${project.slug}`),
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
