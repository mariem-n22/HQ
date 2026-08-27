import { prisma } from "@/lib/prisma";

// Types and pure helpers live in lib/types.ts so Client Components can use
// them without pulling Prisma (and the pg driver) into the browser bundle.
export * from "@/lib/types";

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

export function getBooks() {
  return prisma.book.findMany({ orderBy: { order: "asc" } });
}

export function getCertifications() {
  return prisma.certification.findMany({ orderBy: { order: "asc" } });
}

export function getHeroImages() {
  return prisma.heroImage.findMany({ orderBy: { order: "asc" } });
}

export function getSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

