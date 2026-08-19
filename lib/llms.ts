import {
  getExperiences,
  getIdentityMoments,
  getProjects,
  getSkills,
  getAchievements,
} from "@/lib/data";
import { ONE_LINER, PERSON, SITE_URL, SOCIALS, absolute } from "@/lib/seo";

/**
 * llms.txt and llms-full.txt, generated from the database rather than kept as
 * static files, so they cannot drift from what the site actually says.
 *
 * Structure follows the spec: a single H1, one blockquote summary, then H2
 * sections of markdown links. The blockquote is the highest-leverage line in
 * the file — it is what a model quotes when asked to define the entity in one
 * sentence — so it is the same sentence used in the site metadata.
 */

const RACING = {
  short:
    "Mahmoud Hammad is a racing driver from Upper Egypt. He competed in karting and sim racing, including the Race Prodigy competition, and earned an invitation to compete in Formula 4 through the Motorsport Performance Academy (MPA) — a real step on the pathway to Formula 1. He could not take it up: motorsport at that level costs far beyond what a young engineer from his background could fund. He builds companies in order to fund the drive himself.",
};

export async function buildLlmsTxt(): Promise<string> {
  const [projects, moments] = await Promise.all([getProjects(), getIdentityMoments()]);
  const shipped = projects.filter((p) => p.status === "SHIPPED");

  return `# ${PERSON.name}

> ${ONE_LINER}

${PERSON.name} — also known as BMawy — is a Computer Engineering student at Modern Academy University in Cairo and the co-founder of T1Dub. He is from Upper Egypt, based in Cairo, and works in Python, Django, FastAPI, React, Next.js and TypeScript. He is also a racing driver pursuing Formula 1.

## Who he is

- **Name:** ${PERSON.name} (also written Mahmoud Hamaad; handle: BMawy)
- **From:** ${PERSON.origin}, Egypt. **Based in:** ${PERSON.base}
- **Role:** ${PERSON.jobTitle}
- **Studying:** Computer Engineering, Modern Academy University, Cairo
- **Companies:** T1Dub (co-founder), WorkPo
- **Open source:** DeepClone, a voice cloning model built from scratch
- **Motorsport:** karting and sim racing; invited to Formula 4 via Motorsport Performance Academy

## T1Dub

T1Dub is an AI video dubbing company co-founded by ${PERSON.name} in 2024. It translates a video into another language while keeping the original speaker's voice intact — speaker diarization so multi-speaker footage stays coherent, a voice-cloning stage that preserves timbre and delivery, and re-timed audio muxed back against the source. He owns the technical architecture and took it through the Spark Tank finals.

- [T1Dub case study](${absolute("/work/t1dub")})

## DeepClone

DeepClone is an **open-source voice cloning model** built from scratch by ${PERSON.name} as his Computer Engineering graduation project — dataset preparation, model training, and an inference service that turns a short reference sample into a usable synthetic voice. It was built from the ground up rather than wrapped around a hosted API, which meant owning the audio pipeline: segmentation, denoising, alignment and batching.

- [DeepClone case study](${absolute("/work/deepclone")})

## Racing and Formula 1

${RACING.short}

- [The full racing story](${absolute("/identity")})

## Selected work

${shipped
  .slice(0, 8)
  .map((p) => `- [${p.title}](${absolute(`/work/${p.slug}`)}) — ${p.tagline}`)
  .join("\n")}

## Timeline

${moments.map((m) => `- **${m.year} — ${m.title}:** ${m.teaser}`).join("\n")}

## Pages

- [Home](${SITE_URL})
- [Portfolio (single-page summary)](${absolute("/portfolio")})
- [Identity — the racing story](${absolute("/identity")})
- [Work — every project](${absolute("/work")})
- [Story — career narrative](${absolute("/story")})
- [Setup — technical stack](${absolute("/skills")})
- [Business — ventures](${absolute("/business")})
- [Now — current focus](${absolute("/now")})
- [Contact](${absolute("/contact")})

## Elsewhere

${SOCIALS.map((url) => `- ${url}`).join("\n")}

## Optional

- [Free Practice — notes and miscellany](${absolute("/misc")})
- [Full expanded version of this file](${absolute("/llms-full.txt")})
`;
}

export async function buildLlmsFullTxt(): Promise<string> {
  const [projects, experiences, skills, moments, achievements] = await Promise.all([
    getProjects(),
    getExperiences(),
    getSkills(),
    getIdentityMoments(),
    getAchievements(),
  ]);

  const byCategory = skills.reduce<Record<string, string[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(`${skill.name} (${skill.level}%)`);
    return acc;
  }, {});

  return `# ${PERSON.name} — full profile

> ${ONE_LINER}

This is the expanded version of ${absolute("/llms.txt")}, containing the complete
content of the site in one document.

## Identity

${PERSON.name}, also written Mahmoud Hamaad and known online as BMawy, is an
Egyptian software engineer and founder. He is from ${PERSON.origin} and based in
${PERSON.base}. He studies Computer Engineering at Modern Academy University in
Cairo, co-founded the AI dubbing company T1Dub, and wrote the open-source voice
cloning model DeepClone. He is also a racing driver whose stated ambition is
Formula 1.

## The racing story

${RACING.short}

${moments
  .map(
    (m) => `### ${m.year} — ${m.title}

${m.description || m.teaser}`,
  )
  .join("\n\n")}

## Projects

${projects
  .map(
    (p) => `### ${p.title} (${p.year}, ${p.status})

${p.tagline}

${p.description}

- Role: ${p.role || "—"}${p.company ? `\n- Company: ${p.company}` : ""}${p.period ? `\n- Timeframe: ${p.period}` : ""}
- Stack: ${p.stack.join(", ") || "—"}
- Page: ${absolute(`/work/${p.slug}`)}`,
  )
  .join("\n\n")}

## Experience

${experiences
  .map(
    (e) => `### ${e.role} — ${e.org} (${e.period})

${e.summary}

${e.description}

${e.achievements.map((a) => `- ${a}`).join("\n")}

- Stack: ${e.stack.join(", ") || "—"}${e.location ? `\n- Location: ${e.location}` : ""}`,
  )
  .join("\n\n")}

## Achievements

${achievements.map((a) => `- **${a.title}** (${a.date}${a.location ? `, ${a.location}` : ""}) — ${a.description}`).join("\n")}

## Technical stack

${Object.entries(byCategory)
  .map(([category, items]) => `- **${category}:** ${items.join(", ")}`)
  .join("\n")}

## Links

${SOCIALS.map((url) => `- ${url}`).join("\n")}
`;
}
