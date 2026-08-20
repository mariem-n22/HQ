/**
 * Client-safe types and pure helpers.
 *
 * lib/data.ts imports Prisma (and therefore the pg driver), so any Client
 * Component importing a runtime value from it drags Node builtins into the
 * browser bundle and the page 500s with "Can't resolve 'dns'". Everything a
 * Client Component needs lives here instead; the `@prisma/client` import is
 * type-only and erases at compile time.
 */
import type {
  Achievement,
  HeroImage, ContentBlock, Experience, IdentityMoment, MiscEntry, NowEntry,
  Project, ProjectImage, SiteSettings, Skill, Venture,
} from "@prisma/client";

export type {
  Achievement,
  HeroImage, ContentBlock, Experience, IdentityMoment, MiscEntry, NowEntry,
  Project, ProjectImage, SiteSettings, Skill, Venture,
};

export type ProjectWithImages = Project & { images: ProjectImage[] };
export type ProjectLinks = { live?: string; github?: string; other?: string };
export type GalleryImage = { url: string; caption?: string; alt?: string };

/** A `[[TODO: …]]` placeholder, or simply blank. */
export function isTodo(value: string | null | undefined) {
  return !value || value.trim() === "" || value.trim().startsWith("[[");
}

/** "Title :: body" lines → structured pairs. */
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

export function galleryOf(images: ProjectImage[]): GalleryImage[] {
  return images.map((image) => ({
    url: image.url,
    caption: image.caption || undefined,
    alt: image.alt || undefined,
  }));
}

/**
 * Route the CV through /cv rather than linking the raw Blob URL, so the file
 * downloads as Mahmoud-Hammad-CV.pdf instead of a hashed storage key.
 */
export const CV_PATH = "/cv";

export function findBlock(blocks: ContentBlock[], key: string) {
  return blocks.find((b) => b.key === key);
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
