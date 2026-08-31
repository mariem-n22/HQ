/**
 * PART 4 — one-off import of the Supabase JSON export into Prisma/Postgres.
 * Delete this file once the migration is verified.
 *
 *   DATABASE_URL=... npx tsx scripts/migrate-from-supabase.ts
 *
 * Reads migration/export/*.json (produced by migration/export-supabase.mjs).
 * Idempotent: every write is an upsert keyed on a natural key, so re-running
 * after a partial failure is safe.
 *
 * Mapping notes — the live schema drifted from this repo's migrations, so the
 * source column names below are what the export actually contains, not what
 * supabase/migrations/*.sql says:
 *   - identity_moments: live column is `teaser`; older rows may have `summary`.
 *     Both are coalesced into IdentityMoment.teaser.
 *   - experiences.stack does not exist upstream, so it imports as [] and is
 *     filled in from the dashboard afterwards.
 *   - projects.gallery (jsonb[]) explodes into ProjectImage rows.
 *   - show_on_resume is copied into BOTH showOnResume and showOnPortfolio.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ProjectStatus } from "@prisma/client";
// Shared client: Prisma 7 needs a driver adapter, which lib/prisma.ts sets up.
import { prisma } from "../lib/prisma";

/**
 * The Supabase export carries the old software lifecycle. Map it onto the
 * architecture lifecycle so this one-off importer still runs.
 */
const LEGACY_STATUS: Record<string, ProjectStatus> = {
  BUILDING: ProjectStatus.UNDER_CONSTRUCTION,
  SHIPPED: ProjectStatus.COMPLETED,
  ARCHIVED: ProjectStatus.UNBUILT,
};
const EXPORT_DIR = join(process.cwd(), "migration", "export");

function load<T = Record<string, unknown>>(table: string): T[] {
  try {
    return JSON.parse(readFileSync(join(EXPORT_DIR, `${table}.json`), "utf8")) as T[];
  } catch {
    console.warn(`  ! no export for ${table} — skipping`);
    return [];
  }
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0) => (typeof v === "number" ? v : fallback);
const bool = (v: unknown, fallback = false) => (typeof v === "boolean" ? v : fallback);
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

/** First `n` sentences — used to synthesise a summary where none was captured. */
function opening(text: string, n = 2) {
  return text.split(/(?<=[.!?])\s+/).slice(0, n).join(" ").trim();
}

async function main() {
  const counts: Record<string, number> = {};

  // ---- projects + gallery -------------------------------------------------
  const projects = load("projects");
  for (const p of projects) {
    const slug = str(p.slug);
    if (!slug) continue;
    const showOnResume = bool(p.show_on_resume);
    const project = await prisma.project.upsert({
      where: { slug },
      update: {},
      create: { slug, title: str(p.title, slug) },
    });
    await prisma.project.update({
      where: { id: project.id },
      data: {
        title: str(p.title, slug),
        tagline: str(p.tagline),
        description: str(p.description),
        role: str(p.role),
        stack: arr(p.stack),
        links: (p.links ?? {}) as object,
        // The Supabase export carries the old software lifecycle. Map it onto
        // the architecture one so this one-off importer still runs.
        status: LEGACY_STATUS[String(p.status)] ?? ProjectStatus.CONCEPT,
        year: str(p.year),
        emoji: str(p.emoji),
        coverImage: str(p.cover_image) || null,
        featured: bool(p.featured),
        showOnResume,
        showOnPortfolio: showOnResume,
        order: num(p.sort_order),
      },
    });

    // gallery jsonb -> ProjectImage rows
    const gallery = Array.isArray(p.gallery) ? (p.gallery as Record<string, unknown>[]) : [];
    await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
    for (const [i, image] of gallery.entries()) {
      const url = str(image?.url);
      if (!url) continue;
      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          url,
          caption: str(image?.caption),
          alt: str(image?.alt),
          order: i,
        },
      });
    }
  }
  counts.projects = await prisma.project.count();
  counts.projectImages = await prisma.projectImage.count();

  // ---- skills -------------------------------------------------------------
  for (const s of load("skills")) {
    const name = str(s.name);
    if (!name) continue;
    const level = num(s.level);
    await prisma.skill.upsert({
      where: { id: str(s.id, name) },
      update: {},
      create: { id: str(s.id, name), category: str(s.category, "Tools"), name },
    });
    await prisma.skill.update({
      where: { id: str(s.id, name) },
      data: {
        category: str(s.category, "Tools"),
        name,
        // Legacy rows used a 1-5 scale; lift anything still on it.
        level: level > 0 && level <= 5 ? level * 20 : level,
        icon: str(s.icon),
        iconImage: str(s.icon_image) || null,
        order: num(s.sort_order),
      },
    });
  }
  counts.skills = await prisma.skill.count();

  // ---- experiences --------------------------------------------------------
  for (const e of load("experiences")) {
    const id = str(e.id);
    if (!id) continue;
    const description = str(e.description);
    const data = {
      org: str(e.org),
      role: str(e.role),
      period: str(e.period),
      location: str(e.location) || null,
      // summary was added late upstream; synthesise where it is still blank.
      summary: str(e.summary) || opening(description),
      description,
      achievements: arr(e.achievements),
      // `stack` never existed upstream — fill in from the dashboard.
      stack: arr(e.stack),
      image: str(e.image) || null,
      order: num(e.sort_order),
    };
    await prisma.experience.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  counts.experiences = await prisma.experience.count();

  // ---- content blocks -----------------------------------------------------
  for (const b of load("content_blocks")) {
    const key = str(b.key);
    if (!key) continue;
    const data = { title: str(b.title), body: str(b.body) };
    await prisma.contentBlock.upsert({ where: { key }, update: data, create: { key, ...data } });
  }
  counts.contentBlocks = await prisma.contentBlock.count();

  // ---- identity moments ---------------------------------------------------
  for (const m of load("identity_moments")) {
    const id = str(m.id);
    if (!id) continue;
    const description = str(m.description);
    const data = {
      year: str(m.year),
      title: str(m.title),
      // Live column is `teaser`; this repo's code wrote `summary`. Take either.
      teaser: str(m.teaser) || str(m.summary) || opening(description),
      description,
      image: str(m.image) || null,
      order: num(m.sort_order),
    };
    await prisma.identityMoment.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  counts.identityMoments = await prisma.identityMoment.count();

  // ---- ventures / misc / now / achievements --------------------------------
  for (const v of load("ventures")) {
    const id = str(v.id);
    if (!id) continue;
    const data = {
      name: str(v.name),
      description: str(v.description),
      jurisdiction: str(v.jurisdiction) || null,
      status: str(v.status, "Exploring"),
      image: str(v.image) || null,
      order: num(v.sort_order),
    };
    await prisma.venture.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  counts.ventures = await prisma.venture.count();

  for (const m of load("misc_entries")) {
    const id = str(m.id);
    if (!id) continue;
    const data = {
      title: str(m.title),
      description: str(m.description),
      emoji: str(m.emoji),
      image: str(m.image) || null,
      order: num(m.sort_order),
    };
    await prisma.miscEntry.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  counts.miscEntries = await prisma.miscEntry.count();

  for (const n of load("now_entries")) {
    const id = str(n.id);
    if (!id) continue;
    const data = {
      text: str(n.text),
      active: bool(n.active, true),
      date: n.date ? new Date(String(n.date)) : new Date(),
    };
    await prisma.nowEntry.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  counts.nowEntries = await prisma.nowEntry.count();

  for (const a of load("achievements")) {
    const id = str(a.id);
    if (!id) continue;
    const data = {
      title: str(a.title),
      role: str(a.role),
      category: str(a.category),
      date: str(a.date),
      location: str(a.location),
      description: str(a.description),
      image: str(a.image) || null,
      tags: arr(a.tags),
      order: num(a.sort_order),
    };
    await prisma.achievement.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  counts.achievements = await prisma.achievement.count();

  // ---- site settings (singleton) ------------------------------------------
  const [settings] = load("site_settings");
  if (settings) {
    const data = {
      heroImage: str(settings.hero_image) || null,
      avatarImage: str(settings.avatar_image) || null,
      openToOpportunities: bool(settings.open_to_opportunities, true),
      philosophyQuote: str(settings.philosophy_quote),
      github: str(settings.github),
      linkedin: str(settings.linkedin),
      instagram: str(settings.instagram),
      whatsapp: str(settings.whatsapp),
      phone: str(settings.phone),
      email: str(settings.email),
      location: str(settings.location),
      availability: str(settings.availability),
      resumeUrl: str(settings.resume_url) || null,
    };
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
  }
  counts.siteSettings = await prisma.siteSettings.count();

  // ---- PART 4.4 — row-count reconciliation --------------------------------
  const source: Record<string, number> = {
    projects: load("projects").length,
    skills: load("skills").length,
    experiences: load("experiences").length,
    contentBlocks: load("content_blocks").length,
    identityMoments: load("identity_moments").length,
    ventures: load("ventures").length,
    miscEntries: load("misc_entries").length,
    nowEntries: load("now_entries").length,
    achievements: load("achievements").length,
    siteSettings: load("site_settings").length,
  };

  console.log("\n  table              source -> imported");
  let mismatch = false;
  for (const [key, from] of Object.entries(source)) {
    const to = counts[key] ?? 0;
    const flag = from === to ? "ok" : "MISMATCH";
    if (from !== to) mismatch = true;
    console.log(`  ${key.padEnd(18)} ${String(from).padStart(3)} -> ${String(to).padStart(3)}  ${flag}`);
  }
  console.log(`  ${"projectImages".padEnd(18)}     -> ${String(counts.projectImages).padStart(3)}  (from galleries)`);

  if (mismatch) {
    console.error("\nRow counts do not reconcile — investigate before decommissioning Supabase.");
    process.exitCode = 1;
  } else {
    console.log("\nAll row counts reconcile.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
