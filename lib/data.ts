import { prisma } from "@/lib/prisma";
import type {
  Achievement,
  ContentBlock,
  Experience,
  IdentityMoment,
  MiscEntry,
  NowEntry,
  Project,
  ProjectImage,
  SiteSettings,
  Skill,
  Venture,
} from "@prisma/client";

export type {
  Achievement,
  ContentBlock,
  Experience,
  IdentityMoment,
  MiscEntry,
  NowEntry,
  Project,
  ProjectImage,
  SiteSettings,
  Skill,
  Venture,
};

export type ProjectWithImages = Project & { images: ProjectImage[] };
export type ProjectLinks = { live?: string; github?: string; other?: string };
export type GalleryImage = { url: string; caption?: string; alt?: string };

/** A `[[TODO: …]]` placeholder, or simply blank. */
export function isTodo(value: string | null | undefined) {
  return !value || value.trim() === "" || value.trim().startsWith("[[");
}

/** "Title :: body" lines → structured pairs. Used for editable focus areas. */
export function parsePairs(body: string | null | undefined) {
  return (body ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("::");
      return { title: (title ?? "").trim(), body: rest.join("::").trim() };
    })
    .filter((pair) => pair.title);
}

export function projectLinks(project: Project): ProjectLinks {
  const raw = project.links;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as ProjectLinks;
  return {};
}

/** ProjectImage rows → the shape Gallery/Lightbox expect. */
export function galleryOf(images: ProjectImage[]): GalleryImage[] {
  return images.map((image) => ({
    url: image.url,
    caption: image.caption || undefined,
    alt: image.alt || undefined,
  }));
}

export function findBlock(blocks: ContentBlock[], key: string) {
  return blocks.find((b) => b.key === key);
}

// ---------------------------------------------------------------------------
// Reads. Called from Server Components; each page pulls only what it renders.
// ---------------------------------------------------------------------------

export function getProjects() {
  return prisma.project.findMany({ orderBy: { order: "asc" }, include: { images: true } });
}

export function getProject(slug: string) {
  return prisma.project.findUnique({ where: { slug }, include: { images: true } });
}

export function getSkills() {
  return prisma.skill.findMany({ orderBy: { order: "asc" } });
}

export function getExperiences() {
  return prisma.experience.findMany({ orderBy: { order: "asc" } });
}

export function getAchievements() {
  return prisma.achievement.findMany({ orderBy: { order: "asc" } });
}

export function getIdentityMoments() {
  return prisma.identityMoment.findMany({ orderBy: { order: "asc" } });
}

export function getVentures() {
  return prisma.venture.findMany({ orderBy: { order: "asc" } });
}

export function getMiscEntries() {
  return prisma.miscEntry.findMany({ orderBy: { order: "asc" } });
}

export function getNowEntries() {
  return prisma.nowEntry.findMany({ orderBy: { date: "desc" } });
}

export function getContentBlocks() {
  return prisma.contentBlock.findMany();
}

export function getSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

export const SECTORS = [
  { code: "S1", label: "Story", to: "/story", blurb: "Who I am past the resume line." },
  { code: "S2", label: "Work", to: "/work", blurb: "Products I've shipped and the ones still on track." },
  { code: "S3", label: "Setup", to: "/skills", blurb: "The stack I actually drive." },
  { code: "S4", label: "Identity", to: "/identity", blurb: "Racing, and why it shows up in how I build." },
  { code: "S5", label: "Business", to: "/business", blurb: "Where the company gets incorporated." },
  { code: "S6", label: "Free Practice", to: "/misc", blurb: "Everything that fits nowhere else." },
  { code: "S7", label: "Now", to: "/now", blurb: "What this week actually looks like." },
] as const;
