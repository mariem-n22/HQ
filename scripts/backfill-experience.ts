/**
 * PART 3 — the fuller Experience detail the popup shows.
 *
 *   npx tsx scripts/backfill-experience.ts
 *
 * `stack` never existed in the Supabase schema so it imported empty for every
 * role, and several descriptions were only a sentence or two — which is why a
 * card and its popup looked like the same text. This content was written for
 * the v5 Supabase migration that was never applied; it lands here instead.
 *
 * Sourced from the old portfolio's Professional Experience timeline. Matched on
 * `org`, and only copy that is still thinner than what is here gets replaced,
 * so anything edited in the dashboard afterwards survives a re-run.
 */
import { prisma } from "../lib/prisma";

type Entry = {
  org: string;
  location?: string;
  summary: string;
  description: string[];
  achievements: string[];
  stack: string[];
};

const ENTRIES: Entry[] = [
  {
    org: "T1Dub",
    location: "Cairo, Egypt — remote team",
    summary:
      "Run the company and own the technical architecture: the dubbing pipeline, voice cloning, diarization and the billing model behind it. Pitched to the Spark Tank finals.",
    description: [
      "T1Dub turns a video in one language into the same video in another, with the original speaker's voice intact. I co-founded it and own the technical architecture end to end.",
      "The pipeline starts with speaker diarization so multi-speaker footage stays coherent, moves through a voice-cloning stage that preserves timbre and delivery rather than flattening everyone into one synthetic read, and ends with re-timed audio muxed back against the source video. Around that sits a credit-based subscription layer, because the unit economics of this product live or die on cost per minute of processed audio — so billing had to be part of the architecture, not bolted on later.",
      "Running it as a company rather than a demo means the parts nobody screenshots also have to work: queueing and retries for long jobs, cost controls per tenant, and a story for what happens when a model provider changes pricing overnight. I took it through the Spark Tank finals.",
    ],
    achievements: [
      "Co-founded the company and set the technical direction from the first commit",
      "Architected the end-to-end dubbing pipeline: diarization, voice cloning, re-timing and mux",
      "Built a credit-based subscription layer so per-minute processing cost maps to revenue",
      "Designed async job orchestration with queueing and retries for long-running audio work",
      "Pitched T1Dub through to the Spark Tank finals",
    ],
    stack: ["Python", "FastAPI", "Celery", "Redis", "PostgreSQL", "React"],
  },
  {
    org: "Freelance / owais.media",
    location: "Remote — Cairo, Egypt",
    summary:
      "Client work across the stack — Django and FastAPI on the back, React and Next.js on the front. Shipping to real deadlines for people who do not care what framework it is.",
    description: [
      "Independent client work, taken end to end: scoping the thing, building it, deploying it, and then living with it afterwards.",
      "Backends are usually Django when the domain is CRUD-shaped and benefits from the admin and the ORM, or FastAPI when the job is a service with a narrow contract and async I/O. Frontends are React and Next.js. The database is almost always PostgreSQL.",
      "The useful discipline here is that clients do not care what the stack is. They care that the invoice flow works on the last day of the month and that the site is up. That pressure is what taught me to bias toward boring, debuggable choices and to write the deployment story down before it is needed at 2am.",
    ],
    achievements: [
      "Delivered full-stack client projects end to end — scope, build, deploy, maintain",
      "Built Django and FastAPI backends against PostgreSQL for production client workloads",
      "Shipped React and Next.js frontends to fixed external deadlines",
      "Owned deployment and post-launch maintenance rather than handing off at launch",
    ],
    stack: ["Django", "FastAPI", "React", "Next.js", "PostgreSQL", "Docker"],
  },
  {
    org: "Modern Academy University, Cairo",
    location: "Cairo, Egypt",
    summary:
      "Computer Engineering degree. Most of what I actually use I learned shipping, but the fundamentals came from here.",
    description: [
      "Computer Engineering at Modern Academy University, Cairo.",
      "The honest version: most of what I use day to day I learned by shipping things that broke. But the fundamentals came from here — data structures, algorithms, operating systems, networks, and the maths underneath machine learning. Those are the parts that are genuinely hard to pick up informally, and they are what make the difference when a problem stops being a question of which library to reach for and starts being a question of why something is quadratic.",
      "Coursework includes NegotiAgent, a multi-agent negotiation system built on the negmas library for the AI module.",
    ],
    achievements: [
      "Computer Engineering coursework: data structures, algorithms, operating systems, networks",
      "Built NegotiAgent, a multi-agent negotiation system on the negmas library, for the AI module",
      "Applied coursework fundamentals directly to production work run alongside the degree",
    ],
    stack: ["Python", "C++", "Algorithms", "Operating Systems", "negmas"],
  },
  {
    org: "Greennova",
    summary:
      "Built restaurant management systems and custom WordPress sites for restaurant clients, integrating Egyptian payment gateways and NFC-based ordering.",
    description: [
      "Developed restaurant management systems and custom WordPress websites for restaurant clients, integrating payment gateways and NFC-based solutions.",
      "The work split into two halves. The first was client-facing: bespoke WordPress builds for restaurants, responsive, with the menu and ordering flows each client actually needed rather than a generic template. The second was integration: wiring those sites into Egyptian payment infrastructure — Paymob and Fawry — so online ordering settled properly, and building the API connections between the restaurant sites and the payment processors.",
      "The NFC piece was the most interesting part: tap-to-order and tap-to-pay flows that had to work on staff hardware in a live service environment, where a failed read during a dinner rush is a real problem and not a logged exception.",
    ],
    achievements: [
      "Built custom WordPress websites for restaurant clients with responsive design",
      "Integrated Egyptian payment gateways (Paymob, Fawry) for online ordering systems",
      "Developed API connections between restaurant websites and payment processing systems",
      "Implemented NFC-based solutions for restaurant management workflows",
      "Shipped ordering and management tooling for multiple restaurant clients",
    ],
    stack: ["WordPress", "PHP", "JavaScript", "REST APIs", "Payment Gateways"],
  },
  {
    org: "El Safa Egypt",
    summary:
      "Owned a custom WooCommerce store for a printer-supplies distributor — catalogue, checkout, payments, performance and SEO.",
    description: [
      "Developed and maintained a custom eCommerce website using WordPress and WooCommerce for selling printer and copier supplies.",
      "A supplies catalogue is a deceptively awkward eCommerce problem: a lot of SKUs that differ by tiny compatibility details, customers who search by printer model rather than product name, and stock levels that matter because a back-ordered toner cartridge is a lost sale rather than a delayed one. So the build leaned heavily on custom WordPress hooks and shortcodes for dynamic product filtering, plus reworked search and product pages built around how people actually look for these parts.",
      "Checkout went through Paymob and Fawry. After launch the work shifted to performance and organic visibility — cutting page load times and implementing SEO improvements, which for a catalogue this size is where the traffic actually comes from.",
    ],
    achievements: [
      "Built a custom WooCommerce store with product catalogue and inventory management",
      "Integrated Egyptian payment gateways (Paymob, Fawry) for checkout processing",
      "Created custom WordPress hooks and shortcodes for dynamic product filtering",
      "Customized product pages, search functionality and stock visibility logic",
      "Optimized site performance and implemented SEO improvements",
    ],
    stack: ["WordPress", "WooCommerce", "PHP", "JavaScript", "MySQL"],
  },
  {
    org: "T1 Dubbing",
    location: "Remote",
    summary:
      "Built the dubbing product front to back: the React interface plus the backend audio-processing services and OpenAI integration behind it.",
    description: [
      "Built a full-stack AI-assisted voice dubbing platform focused on voice translation and tone preservation using OpenAI APIs.",
      "On the front end this was React with Tailwind CSS — an interface for uploading source video, tracking a long-running job without the page feeling dead, and reviewing the dubbed result against the original. On the back end it was the audio-processing services and the API orchestration holding the stages together.",
      "The genuinely hard part was tone preservation. A translation that is textually correct but flattens the speaker's delivery reads as worse than no dubbing at all, so a lot of the work went into prompt engineering against the OpenAI APIs and into processing multilingual audio and text datasets to evaluate whether output actually held the original register. The result is a pipeline that runs from video upload to dubbed output without manual steps in the middle.",
    ],
    achievements: [
      "Developed the React and Tailwind CSS product interface",
      "Implemented backend services for audio processing and API orchestration",
      "Integrated the OpenAI API with prompt engineering for voice dubbing workflows",
      "Processed multilingual audio and text datasets for model evaluation",
      "Built the end-to-end pipeline from video upload to dubbed output",
    ],
    stack: ["React", "Node.js", "Express", "OpenAI API", "Python", "Tailwind CSS"],
  },
];

async function main() {
  let updated = 0;

  for (const entry of ENTRIES) {
    const row = await prisma.experience.findFirst({ where: { org: entry.org } });
    if (!row) {
      console.warn(`  ! no Experience row for org "${entry.org}" — skipped`);
      continue;
    }
    const description = entry.description.join("\n\n");
    await prisma.experience.update({
      where: { id: row.id },
      data: {
        summary: row.summary.length >= entry.summary.length ? row.summary : entry.summary,
        description: row.description.length >= description.length ? row.description : description,
        achievements:
          row.achievements.length >= entry.achievements.length ? row.achievements : entry.achievements,
        stack: row.stack.length > 0 ? row.stack : entry.stack,
        ...(entry.location && !row.location ? { location: entry.location } : {}),
      },
    });
    updated += 1;
  }

  console.log(`\n  updated ${updated} of ${ENTRIES.length} roles\n`);

  const rows = await prisma.experience.findMany({ orderBy: { order: "asc" } });
  for (const r of rows) {
    console.log(
      `  ${r.org.padEnd(32)} summary ${String(r.summary.length).padStart(4)}  desc ${String(
        r.description.length,
      ).padStart(5)}  bullets ${r.achievements.length}  stack ${r.stack.length}`,
    );
  }

  const empty = rows.filter((r) => r.stack.length === 0);
  console.log(
    empty.length === 0
      ? "\n  every role has a non-empty stack."
      : `\n  ${empty.length} roles still have an empty stack.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
