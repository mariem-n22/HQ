/**
 * TEMPORARY — seeds a placeholder hero image so the home page layout can be
 * reviewed before the studio's own photography exists.
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │  THIS IS NOT THE STUDIO'S WORK AND MUST NOT SHIP AS FINAL CONTENT.    │
 * │  It is the Heydar Aliyev Center in Baku, by Zaha Hadid Architects.    │
 * │  Replace it from Dashboard → Settings → Home page before going live.  │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * Source   : https://commons.wikimedia.org/wiki/File:Heydar_Aliyev_Center,_Baku_-_HyderAliyevCenter8319.jpg
 * Author   : lumoplank (via Flickr, 55273918585)
 * Licence  : CC0 1.0 Universal — https://creativecommons.org/publicdomain/zero/1.0/
 *
 * CC0 is a public-domain dedication, so no attribution is legally required and
 * the credit below is courtesy rather than obligation. It is still rendered in
 * the hero, because it doubles as the on-screen marker that the image is a
 * placeholder — the one thing that must not quietly disappear before the real
 * photography lands. An earlier candidate for this slot was CC BY-SA, where the
 * credit would have been load-bearing; CC0 was chosen partly to avoid leaving
 * that obligation attached to a temporary asset.
 *
 * The file is copied into this project's own Blob store rather than hotlinked
 * from Wikimedia: their servers are not a CDN for other people's sites, and
 * self-hosting is how the real photography will work too.
 *
 *   bun run hero:placeholder            seed it
 *   bun run hero:placeholder -- --rm    remove it and clear the fields
 */
import "dotenv/config";
import { put, del } from "@vercel/blob";
import { prisma } from "../lib/prisma";

const SOURCE =
  "https://upload.wikimedia.org/wikipedia/commons/9/96/Heydar_Aliyev_Center%2C_Baku_-_HyderAliyevCenter8319.jpg";
const CREDIT =
  "Placeholder — Heydar Aliyev Center by Zaha Hadid Architects. Photograph by lumoplank, CC0.";

async function main() {
  const token = process.env.HQ_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("HQ_READ_WRITE_TOKEN is not set.");

  const current = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  // Any previously seeded placeholder is deleted before a new one is written,
  // on the remove path and the seed path alike, so re-running this never leaves
  // orphaned files accumulating in the Blob store.
  const dropOld = async () => {
    if (!current?.homeHeroUrl?.includes(".blob.vercel-storage.com")) return;
    if (!current.homeHeroUrl.includes("PLACEHOLDER-hero-")) return;
    try {
      await del(current.homeHeroUrl, { token });
    } catch {
      /* the row is updated regardless */
    }
  };

  if (process.argv.includes("--rm")) {
    await dropOld();
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { homeHeroUrl: null, homeHeroCredit: "" },
    });
    return console.log("placeholder hero removed");
  }

  const res = await fetch(SOURCE, {
    headers: { "User-Agent": "mariem-hq/1.0 (placeholder sourcing; contact via site)" },
  });
  if (!res.ok) throw new Error(`Wikimedia returned ${res.status}`);
  // Buffer, not Uint8Array: @vercel/blob's PutBody does not accept a bare
  // typed array, and tsc type-checks this script as part of the build.
  const bytes = Buffer.from(await res.arrayBuffer());

  await dropOld();

  const blob = await put("uploads/PLACEHOLDER-hero-heydar-aliyev-center.jpg", bytes, {
    access: "public",
    token,
    addRandomSuffix: true,
    contentType: "image/jpeg",
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { homeHeroUrl: blob.url, homeHeroCredit: CREDIT },
    create: { id: "singleton", homeHeroUrl: blob.url, homeHeroCredit: CREDIT },
  });

  console.log(`seeded ${(bytes.length / 1024 / 1024).toFixed(1)}MB -> ${blob.url}`);
}

main();
