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
  Book,
  Certification,
  HeroImage, ContentBlock, Experience, IdentityMoment, MiscEntry, NowEntry,
  Project, ProjectImage, ProjectMedia, AchievementMedia, ArchitectProfile, Philosophy,
  SiteSettings, Skill, Venture,
} from "@prisma/client";

export type {
  Achievement,
  Book,
  Certification,
  HeroImage, ContentBlock, Experience, IdentityMoment, MiscEntry, NowEntry,
  Project, ProjectImage, ProjectMedia, AchievementMedia, ArchitectProfile, Philosophy,
  SiteSettings, Skill, Venture,
};

export type ProjectWithImages = Project & { images: ProjectImage[] };
export type ProjectWithMedia = Project & { images: ProjectImage[]; media: ProjectMedia[] };
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
 * downloads as Studio-Profile.pdf instead of a hashed storage key.
 */
export const CV_PATH = "/cv";

export function findBlock(blocks: ContentBlock[], key: string) {
  return blocks.find((b) => b.key === key);
}

/**
 * The navigation, as four groups plus a standalone Contact link.
 *
 * Every entry follows the same rule as before: an item appears only when its
 * page has content, and a group whose children are all empty disappears
 * rather than opening onto an empty menu. `getNavPresence()` in lib/data.ts
 * supplies the per-route answer; this file only declares the shape.
 *
 * Two labels are relabels rather than new pages, resolved by audit rather
 * than assumed: "Ventures" is /business, which already renders ventures and
 * was misnamed, and "Experience" is /story, where the experience list lives
 * under its "Track record" heading.
 */
export type NavItem = { label: string; to: string };
export type NavGroup = { label: string; children: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Work",
    children: [
      { label: "Projects", to: "/work" },
      { label: "Expertise", to: "/skills" },
    ],
  },
  {
    label: "About",
    children: [
      { label: "About", to: "/studio/architect" },
      { label: "Experience", to: "/story" },
      { label: "Identity", to: "/identity" },
      { label: "Ventures", to: "/business" },
      { label: "Misc Entries", to: "/misc" },
    ],
  },
  {
    label: "Studio",
    children: [
      { label: "Philosophy", to: "/studio/philosophy" },
      { label: "Now", to: "/now" },
    ],
  },
  {
    label: "Archive",
    children: [
      { label: "Achievements", to: "/achievements" },
      { label: "Certifications", to: "/certifications" },
      { label: "Books", to: "/books" },
    ],
  },
];

/** Flat list of every routed nav destination, for the home contents grid. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.children);

/**
 * The home page "contents" grid. Labels are kept in step with NAV_GROUPS —
 * the same destination must not be called two different things in two places.
 */
export const SECTORS = [
  { code: "S1", label: "Projects", to: "/work", blurb: "Built, unbuilt and ongoing work." },
  { code: "S2", label: "Expertise", to: "/skills", blurb: "The areas the studio works in." },
  { code: "S3", label: "About", to: "/studio/architect", blurb: "The architect behind the practice." },
  { code: "S4", label: "Experience", to: "/story", blurb: "How the practice came to be, and its track record." },
  { code: "S5", label: "Identity", to: "/identity", blurb: "What shapes the way the studio designs." },
  { code: "S6", label: "Ventures", to: "/business", blurb: "The practice as a company." },
  { code: "S7", label: "Philosophy", to: "/studio/philosophy", blurb: "The studio's design position." },
  { code: "S8", label: "Now", to: "/now", blurb: "What the studio is working on this week." },
  { code: "S9", label: "Achievements", to: "/achievements", blurb: "Competitions, awards and recognition." },
  { code: "S10", label: "Certifications", to: "/certifications", blurb: "Credentials, and where to verify them." },
  { code: "S11", label: "Books", to: "/books", blurb: "Books read, and what the studio took from each." },
  { code: "S12", label: "Misc Entries", to: "/misc", blurb: "Notes and references that fit nowhere else." },
] as const;


// ---------------------------------------------------------------------------
// Architecture project helpers
// ---------------------------------------------------------------------------

export const TYPOLOGY_LABELS: Record<string, string> = {
  RESIDENTIAL: "Residential",
  HOSPITALITY: "Hospitality",
  CULTURAL: "Cultural",
  COMMERCIAL: "Commercial",
  INSTITUTIONAL: "Institutional",
  URBAN: "Urban",
  INTERIORS: "Interiors",
  LANDSCAPE: "Landscape",
};

export const STATUS_LABELS: Record<string, string> = {
  CONCEPT: "Concept",
  UNDER_CONSTRUCTION: "Under construction",
  COMPLETED: "Completed",
  COMPETITION: "Competition",
  UNBUILT: "Unbuilt",
};

/**
 * Book categories. Orthogonal to BookStatus, which is reading progress — a book
 * is both a category and a status, never one or the other.
 */
export const BOOK_CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General",
  CODES_AND_STANDARDS: "Codes & Standards",
};

export const BOOK_CATEGORY_VALUES = Object.keys(BOOK_CATEGORY_LABELS);

export const TYPOLOGY_VALUES = Object.keys(TYPOLOGY_LABELS);
export const STATUS_VALUES = Object.keys(STATUS_LABELS);

export const MEDIA_CATEGORIES = [
  "HERO",
  "GALLERY",
  "PLAN",
  "SECTION",
  "ELEVATION",
  "DIAGRAM",
  "MATERIAL",
  "CONSTRUCTION",
  "SITE",
] as const;
export type MediaCategoryName = (typeof MEDIA_CATEGORIES)[number];

/** A media item flattened for the client components that render it. */
export type MediaItem = {
  url: string;
  embedUrl?: string;
  kind: "IMAGE" | "VIDEO";
  label?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export function toMediaItem(m: ProjectMedia): MediaItem {
  return {
    url: m.url,
    embedUrl: m.embedUrl || undefined,
    kind: m.kind,
    label: m.label || undefined,
    caption: m.caption || undefined,
    alt: m.alt || undefined,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  };
}

/** Group a project's media by section, each already ordered. */
export function mediaByCategory(media: ProjectMedia[]) {
  const out = {} as Record<MediaCategoryName, MediaItem[]>;
  for (const key of MEDIA_CATEGORIES) out[key] = [];
  for (const m of [...media].sort((a, b) => a.order - b.order)) {
    (out[m.category as MediaCategoryName] ??= []).push(toMediaItem(m));
  }
  return out;
}

/**
 * Aspect ratio for an item, or undefined when the dimensions were never
 * captured. Callers fall back to their own default rather than assuming a
 * shape — blind cropping of wide architectural shots is the bug this exists
 * to prevent.
 */
export function ratioOf(item: { width?: number; height?: number }) {
  if (!item.width || !item.height) return undefined;
  return `${item.width} / ${item.height}`;
}

export type Orientation = "landscape" | "portrait" | "square" | "panorama";

export function orientationOf(item: { width?: number; height?: number }): Orientation | undefined {
  if (!item.width || !item.height) return undefined;
  const r = item.width / item.height;
  if (r >= 2.2) return "panorama";
  if (r > 1.12) return "landscape";
  if (r < 0.9) return "portrait";
  return "square";
}

/** "Design Development — 2021" → { label, year }. Year is optional. */
export function parseStage(line: string) {
  const parts = line.split(/\s+[—–-]\s+/);
  if (parts.length < 2) return { label: line.trim(), year: "" };
  const year = parts.pop() as string;
  return { label: parts.join(" — ").trim(), year: year.trim() };
}

/** Turn a Vimeo/YouTube URL into an embeddable one. */
export function embedSrc(url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vim = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`;
  return null;
}

/**
 * URL-safe slug: lowercase, alphanumerics only, single hyphens, no leading or
 * trailing separator. Accented Latin characters are folded to their base form
 * first, so "Málaga" becomes "malaga" rather than losing the letter entirely.
 */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    // Strip combining marks left behind by the decomposition above.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/** An achievement's two photo sets, each already ordered. */
export function achievementMediaSets(media: AchievementMedia[]) {
  const pick = (set: "WORK" | "EVENT"): MediaItem[] =>
    media
      .filter((m) => m.set === set)
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        url: m.url,
        kind: "IMAGE" as const,
        caption: m.caption || undefined,
        alt: m.alt || undefined,
        width: m.width ?? undefined,
        height: m.height ?? undefined,
      }));
  return { work: pick("WORK"), event: pick("EVENT") };
}
