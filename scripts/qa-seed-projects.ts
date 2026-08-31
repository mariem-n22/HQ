/**
 * QA fixtures for the architecture project template.
 *
 * Creates two projects: one with every optional section populated so the full
 * template can be reviewed end to end, and one with only the required fields
 * so graceful degradation is visible. Placeholder media are inline SVG data
 * URIs at deliberately varied aspect ratios — portrait, landscape, square and
 * panoramic — because the point being verified is that the galleries lay out
 * to each image's own shape instead of cropping everything into one box.
 *
 * Re-runnable: both projects are upserted on their slug.
 *
 *   bunx tsx scripts/qa-seed-projects.ts
 *   bunx tsx scripts/qa-seed-projects.ts --remove
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

function plate(w: number, h: number, label: string, tone: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${tone}"/><text x="50%" y="50%" fill="#8a8172" font-family="sans-serif" font-size="${Math.round(Math.min(w, h) / 9)}" text-anchor="middle" dominant-baseline="middle">${label} ${w}x${h}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type M = {
  category: string; kind: "IMAGE" | "VIDEO"; url: string; label?: string;
  caption?: string; alt?: string; width: number; height: number;
};

const media: M[] = [
  { category: "HERO", kind: "IMAGE", url: plate(2400, 1000, "Hero", "#d8d2c6"), width: 2400, height: 1000, alt: "Hero view" },

  { category: "GALLERY", kind: "IMAGE", url: plate(2400, 900, "Panorama", "#cfc8ba"), width: 2400, height: 900, caption: "Panoramic — spans the full row" },
  { category: "GALLERY", kind: "IMAGE", url: plate(1600, 1100, "Landscape", "#d5cec0"), width: 1600, height: 1100, caption: "Landscape" },
  { category: "GALLERY", kind: "IMAGE", url: plate(900, 1400, "Portrait", "#cbc4b6"), width: 900, height: 1400, caption: "Portrait — narrower column" },
  { category: "GALLERY", kind: "IMAGE", url: plate(1200, 1200, "Square", "#d2cbbd"), width: 1200, height: 1200, caption: "Square" },

  { category: "SITE", kind: "IMAGE", url: plate(1800, 1200, "Site", "#ccc5b7"), width: 1800, height: 1200, caption: "The site before works" },

  { category: "DIAGRAM", kind: "IMAGE", url: plate(1000, 1000, "Diagram 1", "#e2ddd2"), width: 1000, height: 1000, label: "Massing" },
  { category: "DIAGRAM", kind: "IMAGE", url: plate(1000, 1000, "Diagram 2", "#e2ddd2"), width: 1000, height: 1000, label: "Subtraction" },
  { category: "DIAGRAM", kind: "IMAGE", url: plate(1000, 1000, "Diagram 3", "#e2ddd2"), width: 1000, height: 1000, label: "Courtyard" },

  { category: "PLAN", kind: "IMAGE", url: plate(2000, 1400, "Site plan", "#efece4"), width: 2000, height: 1400, label: "Site plan" },
  { category: "PLAN", kind: "IMAGE", url: plate(2000, 1400, "Ground floor", "#efece4"), width: 2000, height: 1400, label: "Ground floor" },
  { category: "SECTION", kind: "IMAGE", url: plate(2400, 800, "Section AA", "#efece4"), width: 2400, height: 800, label: "Section AA" },
  { category: "ELEVATION", kind: "IMAGE", url: plate(2400, 700, "North", "#efece4"), width: 2400, height: 700, label: "North elevation" },

  { category: "MATERIAL", kind: "IMAGE", url: plate(600, 600, "Limestone", "#ded7c8"), width: 600, height: 600, label: "Local limestone" },
  { category: "MATERIAL", kind: "IMAGE", url: plate(600, 600, "Oak", "#d3c3a4"), width: 600, height: 600, label: "Untreated oak" },
  { category: "MATERIAL", kind: "IMAGE", url: plate(600, 600, "Concrete", "#c9c6bd"), width: 600, height: 600, label: "Board-formed concrete" },

  { category: "CONSTRUCTION", kind: "IMAGE", url: plate(1600, 1000, "Construction", "#c6bfb1"), width: 1600, height: 1000, caption: "Formwork" },
];

async function main() {
  const remove = process.argv.includes("--remove");
  if (remove) {
    const { count } = await prisma.project.deleteMany({ where: { slug: { in: ["qa-full", "qa-minimal"] } } });
    console.log(`removed ${count} QA projects`);
    return;
  }

  const full = await prisma.project.upsert({
    where: { slug: "qa-full" },
    update: {},
    create: { slug: "qa-full", title: "QA — Courtyard House" },
  });
  await prisma.project.update({
    where: { id: full.id },
    data: {
      title: "QA — Courtyard House",
      tagline: "A placeholder project used to review the full case-study template.",
      typology: "RESIDENTIAL",
      status: "COMPLETED",
      location: "Aswan, Egypt",
      year: "2024",
      period: "2021 — 2024",
      area: "2,400 m²",
      client: "Private",
      collaborators: ["PLACEHOLDER Structures", "PLACEHOLDER Landscape"],
      statement: "PLACEHOLDER STATEMENT. This paragraph exists to show where the concept text sits and how it reads at this measure.\n\nA second paragraph confirms that blank lines break correctly.",
      description: "PLACEHOLDER extended description, shown beneath the statement when the studio wants more room.",
      siteDescription: "PLACEHOLDER context text describing the site, its constraints, and what the building answers.",
      orientation: "North–south axis",
      climate: "Hot arid",
      structuralConcept: "PLACEHOLDER structural narrative.",
      environmentalStrategy: "PLACEHOLDER environmental narrative.",
      lightingConcept: "PLACEHOLDER lighting narrative.",
      constructionDetail: "PLACEHOLDER construction narrative.",
      stages: ["Competition — 2019", "Concept — 2020", "Design development — 2021", "Construction — 2022", "Completed — 2024"],
      recognition: ["PLACEHOLDER Award, shortlist, 2024", "PLACEHOLDER Review, feature, 2025"],
      coverImage: plate(1600, 1000, "Cover", "#d8d2c6"),
      order: 1,
    },
  });
  await prisma.projectMedia.deleteMany({ where: { projectId: full.id } });
  await prisma.projectMedia.createMany({
    data: media.map((m, i) => ({
      projectId: full.id,
      category: m.category as never,
      kind: m.kind as never,
      url: m.url,
      embedUrl: "",
      label: m.label ?? "",
      caption: m.caption ?? "",
      alt: m.alt ?? "",
      width: m.width,
      height: m.height,
      order: i,
    })),
  });

  await prisma.project.upsert({
    where: { slug: "qa-minimal" },
    update: { title: "QA — Minimal Entry", status: "CONCEPT", order: 2 },
    create: { slug: "qa-minimal", title: "QA — Minimal Entry", status: "CONCEPT", order: 2 },
  });

  const counts = await prisma.projectMedia.groupBy({ by: ["category"], _count: true });
  console.log(JSON.stringify({ seeded: ["qa-full", "qa-minimal"], mediaByCategory: counts }, null, 1));
}

main();
