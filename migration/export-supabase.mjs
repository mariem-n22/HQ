/**
 * PART 1.3 — export every public table out of Supabase to JSON before the
 * migration touches anything. Read-only; uses the publishable key, which the
 * "public read" RLS policies allow for all content tables.
 *
 *   node migration/export-supabase.mjs
 *
 * Writes migration/export/<table>.json plus _manifest.json (row counts and the
 * inventory of image URLs that PART 4.2 has to re-host).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "export");

const URL_BASE = process.env.SUPABASE_URL ?? "https://wfyeufgarrdiegdcfrgv.supabase.co";
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!KEY) {
  console.error("Set SUPABASE_PUBLISHABLE_KEY (and optionally SUPABASE_URL) before running.");
  process.exit(1);
}

const TABLES = [
  "projects",
  "skills",
  "experiences",
  "content_blocks",
  "identity_moments",
  "ventures",
  "misc_entries",
  "now_entries",
  "achievements",
  "site_settings",
  // Admin-only under RLS; expected to come back empty with the anon key.
  "contact_messages",
];

/** Fields that may hold a Supabase Storage URL. */
const IMAGE_FIELDS = ["cover_image", "image", "hero_image", "avatar_image"];

async function fetchTable(table) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?select=*`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) {
    return { ok: false, error: `${res.status} ${await res.text()}`, rows: [] };
  }
  return { ok: true, rows: await res.json() };
}

function collectImages(table, rows) {
  const found = [];
  for (const row of rows) {
    for (const field of IMAGE_FIELDS) {
      const value = row[field];
      if (typeof value === "string" && value.trim()) {
        found.push({ table, id: row.id, field, url: value });
      }
    }
    // Galleries are jsonb arrays of { url, caption, alt }.
    for (const key of ["gallery"]) {
      if (Array.isArray(row[key])) {
        for (const item of row[key]) {
          if (item && typeof item.url === "string" && item.url.trim()) {
            found.push({ table, id: row.id, field: `${key}[]`, url: item.url });
          }
        }
      }
    }
  }
  return found;
}

mkdirSync(OUT, { recursive: true });

const manifest = { exportedAt: new Date().toISOString(), source: URL_BASE, tables: {}, images: [] };

for (const table of TABLES) {
  const { ok, error, rows } = await fetchTable(table);
  writeFileSync(join(OUT, `${table}.json`), JSON.stringify(rows, null, 2));
  manifest.tables[table] = ok ? rows.length : `ERROR: ${error}`;
  if (ok) manifest.images.push(...collectImages(table, rows));
  console.log(`${table.padEnd(18)} ${ok ? `${rows.length} rows` : `FAILED — ${error}`}`);
}

writeFileSync(join(OUT, "_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nimage URLs found: ${manifest.images.length}`);
console.log(`written to ${OUT}`);
