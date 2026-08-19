/**
 * The racing narrative for /identity, plus its timeline.
 *
 * Written to the tone directive: factual, composed, unapologetic about the
 * scale of the ambition, and plain about the obstacle without asking for
 * sympathy. Every claim here is one Mahmoud supplied — the Race Prodigy
 * competition, the MPA Formula 4 invitation, the funding wall, and the
 * 1Billion Summit film.
 *
 *   npx tsx scripts/seed-identity.ts
 *
 * Idempotent: the content block is upserted by key and moments by title.
 */
import { prisma } from "../lib/prisma";

const INTRO_TITLE = "The drive";

const INTRO_BODY = [
  "I am from Upper Egypt, and I intend to race in Formula 1.",
  "Those two facts do not usually appear in the same sentence. Motorsport in this region runs on proximity and money — karting seats near capital cities, families who already know the sport, budgets that treat a season as an expense rather than an impossibility. I had none of that. I started anyway, in karting and in sim racing, because the stopwatch is the one part of this sport that does not care where you are from.",
  "I raced competitively, including in the Race Prodigy competition. I was fast enough that the sport noticed: I was invited to compete in Formula 4 through the Motorsport Performance Academy. That is not an aspiration or a wish — it is the actual pathway to Formula 1, and I was offered a place on it.",
  "I could not take it. A Formula 4 season costs more than a Computer Engineering student from Upper Egypt can raise, and there was no family budget behind me to close the gap. I want to be exact about this, because it is the centre of the story rather than a footnote: the obstacle was never lap time. It was funding.",
  "So I changed the route, not the destination. I build companies — T1Dub, WorkPo, and others before them — in order to fund a real shot at professional racing myself. The engineering work and the racing ambition are not two separate lives that happen to belong to the same person. They are the same project, approached from the side that was actually open to me. Some of those ventures did not work. I kept going, because the alternative was to stop, and stopping was never on the table.",
  "In 2024 I wrote, produced and submitted an AI-generated short film about this — my own story and the dream behind it — to the 1Billion Summit in Dubai, competing for funding toward the racing. I did not win. The film was made almost entirely by one person, and it held its own against entries from professional studios with full production teams. I am proud of that, and I will say so plainly: a solo build standing up next to studio work is a real result, whatever the judges decided.",
  "That is the pattern, and I would rather it be understood than admired. Every closed door so far has become a redirect rather than a stop. I am still working toward the same thing — competing at the top level of motorsport, with Formula 1 as the stated ambition — through whichever route is open at the time. Quietly, and without any intention of stopping.",
].join("\n\n");

type Moment = {
  year: string;
  title: string;
  teaser: string;
  description: string;
  order: number;
};

const MOMENTS: Moment[] = [
  {
    year: "2021",
    title: "Karting, from the wrong postcode",
    order: 10,
    teaser:
      "Started racing karts from Upper Egypt — a background with no motorsport around it and no budget behind it.",
    description:
      "Motorsport in Egypt clusters around the capital and around families already inside the sport. Upper Egypt is not on that map. I started in karting anyway, because the entry cost of a stopwatch is nothing and the result it gives you is honest.\n\nKarting is where you find out quickly whether you are actually quick or merely enthusiastic. I kept getting the answer I wanted, so I kept going.",
  },
  {
    year: "2022",
    title: "Sim racing as the affordable proving ground",
    order: 20,
    teaser:
      "Sim racing became the way to keep developing when track time was financially out of reach.",
    description:
      "When seat time costs money you do not have, the simulator is the only track that stays open. I used it the way it should be used — not as a game, but as a way to keep race craft, braking points and consistency sharp between the rare occasions I could actually be in a kart.\n\nIt is also where the engineering brain and the racing brain stopped being separate. Telemetry, data traces, iterating on a setup until the numbers move: that is the same work I do when I am building software.",
  },
  {
    year: "2023",
    title: "Race Prodigy",
    order: 30,
    teaser:
      "Competed in the Race Prodigy competition — the results that put me in front of people who select drivers.",
    description:
      "Race Prodigy was competitive racing against drivers who had been in the sport longer and with more behind them. Performing there is what moved me from someone who races to someone the sport takes seriously.\n\nIt is the step that led directly to the Formula 4 invitation, and the reason I know the ceiling in this story is financial rather than competitive.",
  },
  {
    year: "2024",
    title: "The Formula 4 invitation — and the wall",
    order: 40,
    teaser:
      "Invited to compete in Formula 4 through the Motorsport Performance Academy. Could not take it up: the season cost far beyond what I could fund.",
    description:
      "I was invited to compete in Formula 4 through MPA — the Motorsport Performance Academy. Formula 4 is a real rung on the actual ladder to Formula 1, and this was a genuine offer, not a marketing brochure.\n\nI could not take it. A season at that level costs more than a Computer Engineering student from Upper Egypt can raise, and there was no family budget to close the difference. I state it plainly because it is the centre of this story: I was not turned away on pace. I was turned away by a number.\n\nThat is the moment the plan changed shape. If the sport will not fund the driver, the driver funds himself — which is why I build companies.",
  },
  {
    year: "2024",
    title: "1Billion Summit — the film",
    order: 50,
    teaser:
      "Wrote, produced and submitted an AI-generated short film about the dream to the 1Billion Summit in Dubai. Did not win the funding; the solo build held up against professional studios.",
    description:
      "I wrote, produced and submitted an AI-generated short film to the 1Billion Summit in Dubai, competing for funding toward the racing. The subject was this story — where I am from, what I am chasing, and what stands in the way.\n\nI did not win the funding. What is worth recording is the comparison: the film was made almost entirely by one person, and it stood up against entries from professional studios with full production teams and budgets to match. Solo work holding that line is a real, checkable point of distinction, and I will claim it without apology.\n\nIt also proved something useful about the wider approach — that the AI tooling I build professionally is a lever I can pull on the racing side too.",
  },
  {
    year: "2024 — present",
    title: "Building the funding, not waiting for it",
    order: 60,
    teaser:
      "T1Dub, WorkPo and the rest are the route to the drive — the engineering work and the racing ambition are one project, not two.",
    description:
      "The through-line: I build companies partly to fund a real shot at professional motorsport. T1Dub is the current one — AI video dubbing that keeps the original speaker's voice — and there have been others, some of which did not work.\n\nPeople tend to read the engineer and the racer as two hobbies competing for one person's attention. They are not. Racing needs capital, I do not come from capital, and building software is the fastest legitimate route I have to it. Every product shipped is a step toward a seat.\n\nFormula 1 remains the stated ambition. I am aware of how that sentence reads coming from where I am standing. I am saying it anyway, because I intend to be measured against it.",
  },
];

async function main() {
  const block = await prisma.contentBlock.upsert({
    where: { key: "identity_intro" },
    update: { title: INTRO_TITLE, body: INTRO_BODY },
    create: { key: "identity_intro", title: INTRO_TITLE, body: INTRO_BODY },
  });
  console.log(`content block "${block.key}": ${INTRO_BODY.length} chars, ${INTRO_BODY.split("\n\n").length} paragraphs`);

  for (const moment of MOMENTS) {
    const existing = await prisma.identityMoment.findFirst({ where: { title: moment.title } });
    if (existing) {
      await prisma.identityMoment.update({ where: { id: existing.id }, data: moment });
    } else {
      await prisma.identityMoment.create({ data: moment });
    }
  }

  const rows = await prisma.identityMoment.findMany({ orderBy: { order: "asc" } });
  console.log(`\nidentity moments: ${rows.length}`);
  for (const r of rows) {
    console.log(
      `  ${r.year.padEnd(14)} ${r.title.slice(0, 44).padEnd(46)} teaser ${String(r.teaser.length).padStart(3)}  detail ${String(r.description.length).padStart(4)}`,
    );
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
