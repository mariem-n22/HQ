/**
 * Seeds Mariem's real biographical content.
 *
 *   bun run scripts/seed-mariem.ts
 *
 * Every line here is written from the facts supplied and nothing else: an
 * architecture student at Modern Academy graduating 2027, set on architecture
 * since she was young, ranked second in her cohort, competing regularly,
 * working on projects including freelance, and drawn to heritage, ancient
 * Egyptian and Roman architecture.
 *
 * NOT SET HERE, DELIBERATELY:
 *
 *   SiteSettings.signatureStatement  — the line over the hero
 *   Philosophy.statement             — the pull quote
 *   ArchitectProfile.philosophyNote  — the excerpt of that quote
 *
 * Those three are first-person statements of position, and an earlier
 * instruction on this project was explicit that they must be her own words
 * rather than written for her. They keep their placeholders, which say exactly
 * that, until she supplies real ones. Descriptive and biographical copy is
 * fair to draft from facts; a quote is not.
 *
 * Idempotent: re-running overwrites the fields it owns and touches nothing else.
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.architectProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  await prisma.architectProfile.update({
    where: { id: "singleton" },
    data: {
      name: "Mariem Nasser Elsbelgy",
      roleLine: "Architecture Student — Modern Academy",
      biography:
        "Architecture student at Modern Academy, graduating in 2027, and ranked second in her cohort. She works across studio, competition and freelance projects, and her interest runs to heritage above all — ancient Egyptian and Roman architecture in particular.",
      earlyYears:
        "She has been set on architecture and design since she was young. The ambition came first and the training followed it, rather than the other way round.",
      education:
        "Studying architecture at Modern Academy, graduating in 2027, where she ranks second in her cohort.",
      career:
        "She has worked on a range of projects alongside her studies, some of them freelance commissions taken on independently.",
      milestones:
        "She competes regularly — hackathons and design competitions — and the work submitted to each is kept on the Recognition page rather than summarised here.",
      credentials: ["Modern Academy — Architecture, graduating 2027"],
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      statementHeadline: "Heritage, read closely.",
      statementBody:
        "Ancient Egyptian and Roman architecture are not references to borrow from — they are arguments about proportion, permanence and place that still hold. The work starts by reading them properly.\n\nStudio projects, competition entries and freelance commissions all get the same treatment: understand what the site already knows, then build something that belongs to it.",
      practiceHeadline: "Studying, competing, and building a body of work.",
      practiceBody:
        "The work runs on three tracks at once. Studio projects at Modern Academy, where the training is; competitions and hackathons, where an idea has to survive a deadline and a jury; and freelance commissions, where it has to survive a client.\n\nEach one asks something different, and the overlap between them is where the actual practice is forming.",
      practiceDisciplines: [
        "Architectural design",
        "Heritage and conservation",
        "Competition and concept work",
        "Freelance commissions",
      ],
    },
  });

  const p = await prisma.architectProfile.findUnique({ where: { id: "singleton" } });
  const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const ph = await prisma.philosophy.findUnique({ where: { id: "singleton" } });
  console.log("profile name      :", p?.name);
  console.log("profile role      :", p?.roleLine);
  console.log("statementHeadline :", s?.statementHeadline);
  console.log("practiceHeadline  :", s?.practiceHeadline);
  console.log("disciplines       :", s?.practiceDisciplines.length);
  console.log("");
  console.log("HELD BACK (must be her own words):");
  console.log("  signatureStatement :", JSON.stringify(s?.signatureStatement ?? ""));
  console.log("  philosophyNote     :", JSON.stringify(p?.philosophyNote ?? ""));
  console.log("  Philosophy.statement:", ph ? JSON.stringify(ph.statement) : "(no row)");
}

main();
