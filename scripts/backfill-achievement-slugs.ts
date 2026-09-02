/**
 * Backfill Achievement slugs from titles.
 *
 * The column was added with a "" default, so every existing row shares the
 * same value and a unique constraint cannot be applied until they differ.
 * Idempotent: rows already carrying a clean slug are left alone.
 *
 *   bun run fix:achievement-slugs          report only
 *   bun run fix:achievement-slugs --apply  write
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/types";

const CLEAN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await prisma.achievement.findMany({ select: { id: true, slug: true, title: true } });
  const taken = new Set(rows.filter((r) => CLEAN.test(r.slug)).map((r) => r.slug));
  const fixes: { id: string; from: string; to: string }[] = [];

  for (const row of rows) {
    if (CLEAN.test(row.slug)) continue;
    const base = slugify(row.title) || `achievement-${row.id.slice(-6)}`;
    let next = base;
    let n = 2;
    while (taken.has(next)) next = `${base}-${n++}`;
    taken.add(next);
    fixes.push({ id: row.id, from: row.slug, to: next });
  }

  console.log(JSON.stringify({ scanned: rows.length, toFix: fixes.length, fixes }, null, 1));
  if (!apply) return console.log("\nreport only — re-run with --apply to write");
  for (const f of fixes) await prisma.achievement.update({ where: { id: f.id }, data: { slug: f.to } });
  console.log(`applied ${fixes.length}`);
}

main();
