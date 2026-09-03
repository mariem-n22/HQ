import type { Metadata } from "next";

/**
 * One source of truth for canonical identity, URLs and structured data.
 *
 * Entity naming is deliberately rigid. Generative engines resolve entities by
 * consistent surface form, so variant spellings split the entity and weaken
 * every mention. Three forms exist and each has exactly one job — pick by
 * context, never by preference.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://portfolio-hq-e8g7.vercel.app")
).replace(/\/$/, "");

/**
 * The three name forms.
 *
 * - `short` — the wordmark. Nav, hero, footer mark. A wordmark is a mark, not
 *   a legal name, and the full three-part name does not fit the header at
 *   mobile widths without truncating.
 * - `title` — browser tab and search result titles. Long enough to identify
 *   her, short enough to survive Google's ~60-character truncation once a page
 *   suffix is appended.
 * - `full` — running prose, the footer line, and every structured-data `name`.
 *   This is the form that has to match her name elsewhere on the web for an
 *   engine to reconcile the entity, so it is the one machines are given.
 */
export const PERSON = {
  short: "Mariem",
  title: "Mariem N. Elsbelgy",
  full: "Mariem Nasser Elsbelgy",

  /**
   * Deliberately "Architecture Student" and not "Architect".
   *
   * She graduates in 2027, and in most jurisdictions "Architect" is a
   * protected title that carries registration. Structured data is the most
   * machine-trusted place on the page, so a claim made here is the one most
   * likely to be repeated as fact. The description below carries the substance
   * of the work; this field stays literally accurate.
   */
  jobTitle: "Architecture Student",
  discipline: "Architecture",
  school: "Modern Academy",
  graduationYear: 2027,
} as const;

/**
 * Real profile URLs, once they exist.
 *
 * `sameAs` is how a search or generative engine reconciles this site with her
 * other presences into one entity, so it is the single highest-value field
 * here — and the one most damaged by a guess. Nothing goes in until the URL is
 * real and confirmed; a wrong or dead profile link is worse than none.
 */
export const SOCIALS: readonly string[] = [];

/**
 * One-sentence canonical definition. Kept identical in llms.txt.
 *
 * This is the sentence an engine quotes when asked to define her in one line,
 * so it holds only supplied facts: what she studies, where, when she finishes,
 * and what she is drawn to. No invented projects, awards or years.
 */
export const ONE_LINER =
  "Mariem Nasser Elsbelgy is an architecture student at Modern Academy, graduating in 2027, ranked second in her cohort — working across studio and freelance projects, and drawn to heritage, ancient Egyptian and Roman architecture.";

/** Longer form, for pages that have room for a paragraph rather than a line. */
export const BIO =
  "Mariem Nasser Elsbelgy has been set on architecture and design since she was young. She is studying architecture at Modern Academy, graduating in 2027, where she ranks second in her cohort. She competes regularly, and has worked on a range of projects, some of them freelance. Her interest runs to heritage above all — ancient Egyptian and Roman architecture in particular, and what they still have to teach about proportion, permanence and place.";

export function absolute(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Page metadata with canonical and Open Graph filled in consistently. Every
 * title anchors on her name, because name recognition is the primary query
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
      siteName: PERSON.title,
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
 * Mariem as a Person — the site's primary entity.
 *
 * This replaces the anonymous Organization node the site carried while it had
 * no name to put on it, which in turn replaced a developer-portfolio graph of
 * a person and three companies. Only supplied facts are emitted. No address,
 * no award count, no project count, no birth date, and no sameAs until real
 * URLs exist: structured data is where a fabricated fact does the most damage,
 * because it is read as an assertion rather than as prose.
 */
export const personSchema = (): Json => ({
  "@type": "Person",
  "@id": absolute("/#person"),
  name: PERSON.full,
  alternateName: PERSON.title,
  url: SITE_URL,
  jobTitle: PERSON.jobTitle,
  description: ONE_LINER,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: PERSON.school,
  },
  knowsAbout: [
    "Architecture",
    "Architectural design",
    "Heritage architecture",
    "Ancient Egyptian architecture",
    "Roman architecture",
    "Architectural conservation",
    "Interior architecture",
  ],
  ...(SOCIALS.length > 0 ? { sameAs: [...SOCIALS] } : {}),
});

/**
 * The home page as a ProfilePage about her.
 *
 * `mainEntity` is what tells an engine this is a page *about* a person rather
 * than a page that happens to mention one — the distinction that makes a
 * knowledge-panel-style result possible at all.
 */
export const profilePageSchema = (): Json => ({
  "@type": "ProfilePage",
  "@id": absolute("/#profilepage"),
  url: SITE_URL,
  name: `${PERSON.title} — Architecture Portfolio`,
  description: ONE_LINER,
  mainEntity: { "@id": absolute("/#person") },
});

/**
 * Kept as an alias so callers that referenced the studio node keep resolving
 * to the site's single entity, which is now the person.
 */
export const studioSchema = personSchema;

/** `@graph` keeps every entity in one script tag with resolvable @ids. */
export function graph(...nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}
