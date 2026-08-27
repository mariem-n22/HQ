/**
 * Seeds the four books Mahmoud has read or is reading.
 *
 *   npx tsx scripts/seed-books.ts
 *
 * Idempotent: matched on title, following scripts/seed-identity.ts.
 *
 * Only title, author and status are set. `highlights` and `takeaway` are
 * deliberately left empty — those have to be his own words, and inventing
 * quotes or a "what I learned" summary on his behalf would put fabricated
 * content on his site. `coverImage` is left null for the same reason: the
 * Frame placeholder is honest, a generic or wrong cover is not.
 *
 * AIMA is ordered first because it is the one currently in progress.
 */
import { prisma } from "../lib/prisma";

type Seed = {
  title: string;
  author: string;
  status: "READING" | "FINISHED";
  order: number;
};

const BOOKS: Seed[] = [
  {
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell & Peter Norvig",
    status: "READING",
    order: 10,
  },
  {
    title: "ضربة البداية",
    author: "محمد نجاتي",
    status: "FINISHED",
    order: 20,
  },
  {
    title: "سيكولوجية المال",
    author: "مورجان هاوسل",
    status: "FINISHED",
    order: 30,
  },
  {
    title: "الأب الغني والأب الفقير",
    author: "روبرت كيوساكي",
    status: "FINISHED",
    order: 40,
  },
];

async function main() {
  for (const book of BOOKS) {
    const existing = await prisma.book.findFirst({ where: { title: book.title } });
    if (existing) {
      // Never overwrite highlights/takeaway — if he has written any since, they stay.
      await prisma.book.update({
        where: { id: existing.id },
        data: { author: book.author, status: book.status, order: book.order },
      });
    } else {
      await prisma.book.create({ data: book });
    }
  }

  const rows = await prisma.book.findMany({ orderBy: { order: "asc" } });
  console.log(`\n  ${rows.length} books\n`);
  for (const r of rows) {
    console.log(
      `  ${String(r.order).padStart(3)}  ${r.status.padEnd(8)}  ${r.title}  —  ${r.author}` +
        `  [highlights: ${r.highlights.length}, takeaway: ${r.takeaway.length} chars, cover: ${r.coverImage ?? "none"}]`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
