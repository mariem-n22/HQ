import type { Metadata } from "next";

/**
 * One source of truth for canonical identity, URLs and structured data.
 *
 * Entity naming is deliberately rigid — the studio name is
 * spelled identically everywhere on the site. Generative engines resolve
 * entities by consistent surface form, so variant spellings split the entity
 * and weaken every mention.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://portfolio-hq-e8g7.vercel.app")
).replace(/\/$/, "");

/**
 * Studio identity.
 *
 * Deliberately unnamed. The site was built for a named individual with real
 * social accounts and real companies attached; repurposing it as an
 * architecture studio meant either inventing an architect or asserting a
 * profession about a real person. Neither is acceptable, so every personal
 * fact was removed rather than rewritten, and nothing here claims a name,
 * a location, a founding date or a credential that has not been supplied.
 *
 * `name` is the one value to replace once the studio's real name is decided —
 * change it here and it propagates to titles, the footer, the OG card and the
 * structured data. Until then it is a generic descriptor, which is accurate.
 */
export const STUDIO = {
  name: "Architecture Studio",
  /** Shown wherever a discipline line is needed. */
  discipline: "Architecture",
} as const;

/** No accounts are asserted until real ones are supplied. */
export const SOCIALS: readonly string[] = [];

/**
 * One-sentence canonical definition. Kept identical in llms.txt.
 *
 * Describes what the site *is* rather than who runs it, because the latter is
 * not yet known. Contains no unverifiable claim.
 */
export const ONE_LINER =
  "An architecture studio's archive of selected projects — residential, cultural, hospitality and urban work, presented as drawings, photography and written project statements.";

export function absolute(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Page metadata with canonical and Open Graph filled in consistently. Every
 * title anchors on the person, because name recognition is the primary query
 * family this site has to win.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
}): Metadata {
  const url = absolute(path);
  const ogImage = image ?? absolute("/opengraph-image");

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: STUDIO.name,
      locale: "en_US",
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

export type Json = Record<string, unknown>;

/**
 * The studio as an organisation.
 *
 * Replaces the Person/T1Dub/WorkPo/DeepClone graph the site carried as a
 * developer portfolio. Only fields that are actually true of this site are
 * emitted: no founder, no founding date, no address, no sameAs — asserting
 * any of those in structured data would be publishing a fabricated fact in
 * the most machine-trusted place on the page.
 */
export const studioSchema = (): Json => ({
  "@type": "Organization",
  "@id": absolute("/#studio"),
  name: STUDIO.name,
  url: SITE_URL,
  description: ONE_LINER,
  knowsAbout: [
    "Architecture",
    "Architectural design",
    "Residential architecture",
    "Cultural architecture",
    "Hospitality design",
    "Urban design",
    "Interior architecture",
    "Landscape architecture",
  ],
  ...(SOCIALS.length > 0 ? { sameAs: [...SOCIALS] } : {}),
});

/**
 * Kept as an alias so the pages that referenced the old person node keep
 * resolving to the site's single entity. Remove once every caller has moved.
 */
export const personSchema = studioSchema;

/** `@graph` keeps every entity in one script tag with resolvable @ids. */
export function graph(...nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}
