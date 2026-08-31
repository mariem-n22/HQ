import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { prisma } from "@/lib/prisma";

// Types and pure helpers live in lib/types.ts so Client Components can use
// them without pulling Prisma (and the pg driver) into the browser bundle.
export * from "@/lib/types";

// ---------------------------------------------------------------------------
// Build-time degradation
//
// Most public routes are prerendered, so `next build` runs every read below
// against the real database. If that database is unreachable or has never been
// provisioned, Prisma throws and the whole deployment fails — which is exactly
// what happened on Vercel: the Neon database had zero tables, `getProjects()`
// threw P2021 during "Collecting page data", and the build exited 1 with no
// useful message.
//
// A missing database should produce an empty site, not a failed deploy. The
// pages already render an `EmptyState` for every collection, so degrading to
// empty results is a shape the UI is built for.
//
// Deliberately narrow, so this never masks a real bug:
//   - only during `next build` (NEXT_PHASE), never at request time
//   - only for connectivity and not-provisioned errors, never for a genuine
//     query fault such as a bad `where` clause
//   - always logged loudly, so a degraded build is visible in the log
// ---------------------------------------------------------------------------

const isBuildPhase = () => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

/**
 * Prisma error codes that mean "the database is not ready", as opposed to
 * "this query is wrong".
 *
 * P1000 authentication failed        P1001 can't reach database server
 * P1002 connection timed out         P1003 database does not exist
 * P1017 server closed the connection P2021 table does not exist
 * P2022 column does not exist
 */
const NOT_PROVISIONED = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1017",
  "P2021",
  "P2022",
]);

function isNotProvisioned(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code;
  if (typeof code === "string" && NOT_PROVISIONED.has(code)) return true;
  // The lazy client in lib/prisma.ts throws a plain Error when DATABASE_URL is
  // absent entirely, which carries no Prisma code.
  return error instanceof Error && error.message.includes("DATABASE_URL is not set");
}

async function safeRead<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (isBuildPhase() && isNotProvisioned(error)) {
      const code = (error as { code?: string })?.code ?? "no code";
      console.warn(
        `[data] ${label}: database not ready during build (${code}) — ` +
          `prerendering this route empty. Run \`bun run db:push\` and redeploy ` +
          `once the database is provisioned.`,
      );
      return fallback;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Reads. Called from Server Components; each page pulls only what it renders.
// ---------------------------------------------------------------------------

export function getProjects() {
  return safeRead(
    "getProjects",
    () =>
      prisma.project.findMany({
        orderBy: { order: "asc" },
        include: { images: true, media: { orderBy: { order: "asc" } } },
      }),
    [],
  );
}

export function getProject(slug: string) {
  return safeRead(
    "getProject",
    () =>
      prisma.project.findUnique({
        where: { slug },
        include: { images: true, media: { orderBy: { order: "asc" } } },
      }),
    null,
  );
}

/**
 * The archive in display order, trimmed to what the "next project" pager
 * needs. Kept separate from getProjects so a detail page does not pull every
 * project's full media set just to find its neighbour.
 */
export function getProjectOrder() {
  return safeRead(
    "getProjectOrder",
    () =>
      prisma.project.findMany({
        orderBy: { order: "asc" },
        select: { slug: true, title: true, coverImage: true, location: true, year: true },
      }),
    [],
  );
}

export function getArchitectProfile() {
  return safeRead(
    "getArchitectProfile",
    () => prisma.architectProfile.findUnique({ where: { id: "singleton" } }),
    null,
  );
}

export function getPhilosophy() {
  return safeRead(
    "getPhilosophy",
    () => prisma.philosophy.findUnique({ where: { id: "singleton" } }),
    null,
  );
}

export function getSkills() {
  return safeRead("getSkills", () => prisma.skill.findMany({ orderBy: { order: "asc" } }), []);
}

export function getExperiences() {
  return safeRead(
    "getExperiences",
    () => prisma.experience.findMany({ orderBy: { order: "asc" } }),
    [],
  );
}

export function getAchievements() {
  return safeRead(
    "getAchievements",
    () => prisma.achievement.findMany({ orderBy: { order: "asc" } }),
    [],
  );
}

export function getIdentityMoments() {
  return safeRead(
    "getIdentityMoments",
    () => prisma.identityMoment.findMany({ orderBy: { order: "asc" } }),
    [],
  );
}

export function getVentures() {
  return safeRead("getVentures", () => prisma.venture.findMany({ orderBy: { order: "asc" } }), []);
}

export function getMiscEntries() {
  return safeRead(
    "getMiscEntries",
    () => prisma.miscEntry.findMany({ orderBy: { order: "asc" } }),
    [],
  );
}

export function getNowEntries() {
  return safeRead("getNowEntries", () => prisma.nowEntry.findMany({ orderBy: { date: "desc" } }), []);
}

export function getContentBlocks() {
  return safeRead("getContentBlocks", () => prisma.contentBlock.findMany(), []);
}

export function getBooks() {
  return safeRead("getBooks", () => prisma.book.findMany({ orderBy: { order: "asc" } }), []);
}

export function getCertifications() {
  return safeRead(
    "getCertifications",
    () => prisma.certification.findMany({ orderBy: { order: "asc" } }),
    [],
  );
}

export function getHeroImages() {
  return safeRead("getHeroImages", () => prisma.heroImage.findMany({ orderBy: { order: "asc" } }), []);
}

export function getSettings() {
  return safeRead(
    "getSettings",
    () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    null,
  );
}
