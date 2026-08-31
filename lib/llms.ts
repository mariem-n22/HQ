import { getExperiences, getProjects, getSkills, getAchievements } from "@/lib/data";
import { ONE_LINER, STUDIO, SITE_URL, SOCIALS, absolute } from "@/lib/seo";
import { STATUS_LABELS, TYPOLOGY_LABELS } from "@/lib/types";

/**
 * llms.txt and llms-full.txt, generated from the database rather than kept as
 * static files, so they cannot drift from what the site actually says.
 *
 * Structure follows the spec: a single H1, one blockquote summary, then H2
 * sections of markdown links. The blockquote is the highest-leverage line in
 * the file — it is what a model quotes when asked to define the entity in one
 * sentence — so it is the same sentence used in the site metadata.
 *
 * Everything here is derived from real rows. The previous version carried a
 * hand-written biography naming a person, two companies, a university and a
 * motorsport career; none of that describes an architecture studio, and this
 * file is precisely where a fabricated fact does the most damage, because
 * models quote it verbatim. So nothing is asserted that the database cannot
 * back: no founding date, no headcount, no awards beyond the recognition
 * lines a project actually carries.
 */

function projectLine(p: {
  title: string;
  slug: string;
  location: string;
  year: string;
  status: string;
  typology: string | null;
  tagline: string;
}) {
  const facts = [
    p.typology ? TYPOLOGY_LABELS[p.typology] ?? p.typology : "",
    p.location,
    p.year,
    STATUS_LABELS[p.status] ?? p.status,
  ].filter(Boolean);
  const meta = facts.length ? ` — ${facts.join(", ")}` : "";
  const note = p.tagline ? `: ${p.tagline}` : "";
  return `- [${p.title}](${absolute(`/work/${p.slug}`)})${meta}${note}`;
}

export async function buildLlmsTxt(): Promise<string> {
  const projects = await getProjects();
  const completed = projects.filter((p) => p.status === "COMPLETED");

  return `# ${STUDIO.name}

> ${ONE_LINER}

## Work

${projects.length > 0 ? projects.map(projectLine).join("\n") : "- No projects published yet."}

## Studio

- [The Architect](${absolute("/studio/architect")})
- [Philosophy](${absolute("/studio/philosophy")})
- [Practice](${absolute("/skills")})
- [Contact](${absolute("/contact")})

## Optional

- [Studio notes](${absolute("/misc")})
- [Reading](${absolute("/books")})
- [Full detail](${absolute("/llms-full.txt")})

${completed.length > 0 ? `Completed projects: ${completed.length}.` : ""}
`.trim();
}

export async function buildLlmsFullTxt(): Promise<string> {
  const [projects, skills, experiences, achievements] = await Promise.all([
    getProjects(),
    getSkills(),
    getExperiences(),
    getAchievements(),
  ]);

  const sections: string[] = [];

  sections.push(`# ${STUDIO.name} — full detail

> ${ONE_LINER}

Site: ${SITE_URL}
${SOCIALS.length > 0 ? SOCIALS.map((u) => `- ${u}`).join("\n") : ""}`.trim());

  if (projects.length > 0) {
    sections.push(
      `## Projects\n\n${projects
        .map((p) => {
          const rows = [
            p.typology ? `- Type: ${TYPOLOGY_LABELS[p.typology] ?? p.typology}` : "",
            p.location ? `- Location: ${p.location}` : "",
            p.period || p.year ? `- Year: ${p.period || p.year}` : "",
            `- Status: ${STATUS_LABELS[p.status] ?? p.status}`,
            p.area ? `- Area: ${p.area}` : "",
            p.client ? `- Client: ${p.client}` : "",
            p.collaborators.length ? `- Collaborators: ${p.collaborators.join(", ")}` : "",
            p.recognition.length ? `- Recognition: ${p.recognition.join("; ")}` : "",
          ].filter(Boolean);
          const body = [p.statement, p.description].filter((t) => t.trim()).join("\n\n");
          return `### ${p.title}\n\n${rows.join("\n")}\n\n${body}`.trim();
        })
        .join("\n\n")}`,
    );
  }

  if (skills.length > 0) {
    sections.push(`## Practice\n\n${skills.map((s) => `- ${s.name}`).join("\n")}`);
  }

  if (experiences.length > 0) {
    sections.push(
      `## Experience\n\n${experiences
        .map((e) => {
          const rows = [
            e.org ? `- Organisation: ${e.org}` : "",
            e.period ? `- Period: ${e.period}` : "",
            e.location ? `- Location: ${e.location}` : "",
          ].filter(Boolean);
          return `### ${e.role}\n\n${rows.join("\n")}\n\n${e.summary}`.trim();
        })
        .join("\n\n")}`,
    );
  }

  if (achievements.length > 0) {
    sections.push(
      `## Recognition\n\n${achievements
        .map((a) => `- ${a.title}${a.date ? ` (${a.date})` : ""}${a.description ? ` — ${a.description}` : ""}`)
        .join("\n")}`,
    );
  }

  return sections.join("\n\n").trim();
}
