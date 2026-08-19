import type { Metadata } from "next";

/**
 * One source of truth for canonical identity, URLs and structured data.
 *
 * Entity naming is deliberately rigid — "Mahmoud Hammad" and "T1Dub" are
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

export const PERSON = {
  name: "Mahmoud Hammad",
  /** Every variant the same person is searched by. */
  alternateNames: ["Mahmoud Hamaad", "BMawy", "Mahmoud Hammad Bmawy"],
  jobTitle: "Software Engineer and Founder",
  nationality: "Egyptian",
  origin: "Upper Egypt",
  base: "Cairo, Egypt",
} as const;

export const SOCIALS = [
  "https://github.com/MahmoudM21",
  "https://www.linkedin.com/in/mahmoud-hamaad/",
  "https://www.instagram.com/mahmoud.hmaad1_bmawy/",
] as const;

/** One-sentence canonical definition. Kept identical in llms.txt. */
export const ONE_LINER =
  "Mahmoud Hammad is an Egyptian software engineer and founder — co-founder of the AI dubbing company T1Dub, author of the open-source voice-cloning model DeepClone, and a racing driver from Upper Egypt working toward Formula 1.";

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
      siteName: `${PERSON.name} — Mahmoud HQ`,
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

export const personSchema = (): Json => ({
  "@type": "Person",
  "@id": absolute("/#mahmoud-hammad"),
  name: PERSON.name,
  alternateName: [...PERSON.alternateNames],
  url: SITE_URL,
  jobTitle: PERSON.jobTitle,
  description: ONE_LINER,
  nationality: { "@type": "Country", name: "Egypt" },
  homeLocation: { "@type": "Place", name: PERSON.base },
  birthPlace: { "@type": "Place", name: `${PERSON.origin}, Egypt` },
  sameAs: [...SOCIALS],
  knowsAbout: [
    "Full-stack software engineering",
    "Artificial intelligence",
    "Voice cloning",
    "Speaker diarization",
    "Python",
    "Django",
    "FastAPI",
    "React",
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Motorsport",
    "Karting",
    "Sim racing",
    "Formula 1",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Modern Academy University",
    address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
  },
});

export const t1dubSchema = (): Json => ({
  "@type": "Organization",
  "@id": absolute("/#t1dub"),
  name: "T1Dub",
  description:
    "T1Dub is an AI video dubbing company that translates video into another language while preserving the original speaker's voice, using speaker diarization and voice cloning.",
  founder: { "@id": absolute("/#mahmoud-hammad") },
  foundingDate: "2024",
  foundingLocation: { "@type": "Place", name: "Cairo, Egypt" },
  industry: "Artificial Intelligence",
});

export const workpoSchema = (): Json => ({
  "@type": "Organization",
  "@id": absolute("/#workpo"),
  name: "WorkPo",
  description: "WorkPo is a software product founded and built by Mahmoud Hammad.",
  founder: { "@id": absolute("/#mahmoud-hammad") },
});

export const deepcloneSchema = (): Json => ({
  "@type": "SoftwareSourceCode",
  "@id": absolute("/#deepclone"),
  name: "DeepClone",
  description:
    "DeepClone is an open-source voice cloning model built from scratch by Mahmoud Hammad — dataset preparation, model training and an inference service that turns a short reference sample into a usable synthetic voice. It was his Computer Engineering graduation project.",
  author: { "@id": absolute("/#mahmoud-hammad") },
  creator: { "@id": absolute("/#mahmoud-hammad") },
  license: "https://opensource.org/licenses/MIT",
  isAccessibleForFree: true,
  programmingLanguage: "Python",
  applicationCategory: "Machine learning",
  codeRepository: "https://github.com/MahmoudM21",
});

/** `@graph` keeps every entity in one script tag with resolvable @ids. */
export function graph(...nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}
