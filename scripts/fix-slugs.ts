/**
 * One-off repair for project slugs written before the save path sanitised
 * them. Idempotent: rows already matching [a-z0-9-]+ are left alone.
 *
 *   bun run fix:slugs          report only
 *   bun run fix:slugs --apply  write the corrections
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/types";

const CLEAN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await prisma.project.findMany({ select: { id: true, slug: true, title: true } });
  const taken = new Set(rows.filter((r) => CLEAN.test(r.slug)).map((r) => r.slug));
  const fixes: { id: string; from: string; to: string }[] = [];

  for (const row of rows) {
    if (CLEAN.test(row.slug)) continue;
    let next = slugify(row.slug) || slugify(row.title) || `project-${row.id.slice(-6)}`;
    // Slug is unique in the schema; never collide with an already-valid row.
    let n = 2;
    const base = next;
    while (taken.has(next)) next = `${base}-${n++}`;
    taken.add(next);
    fixes.push({ id: row.id, from: row.slug, to: next });
  }

  console.log(JSON.stringify({ scanned: rows.length, malformed: fixes.length, fixes }, null, 1));
  if (!apply) return console.log("\nreport only — re-run with --apply to write");
  for (const f of fixes) await prisma.project.update({ where: { id: f.id }, data: { slug: f.to } });
  console.log(`applied ${fixes.length} correction(s)`);
}

main();
