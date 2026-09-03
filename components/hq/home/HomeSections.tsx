import Link from "next/link";
import { Frame } from "../Frame";
import { Reveal } from "../Reveal";
import { NowList } from "../NowList";
import type { NowEntry } from "@/lib/types";

/**
 * Home page sections 04–08.
 *
 * Every one of these hides itself when the content behind it is empty, so the
 * home page shows three real sections today rather than five empty boxes while
 * the site is being filled in. That rule is enforced here, at the component,
 * rather than at the call site: a section knows what it needs, and putting the
 * test next to the markup keeps the two from drifting apart.
 *
 * None of them invents copy. Where a section has no canonical source of its own
 * it reads one that already exists — Philosophy and Recognition in particular
 * aggregate rather than duplicate, so there is no second copy to diverge.
 *
 * The layouts are deliberately unalike: image-led, then list-beside-paragraph,
 * then a centred pull quote, then a numbered index, then a compact feed. Five
 * consecutive text blocks in the same shape would read as a wall however good
 * the individual sections were.
 */

/** Shared section frame: consistent rhythm, one place to change it. */
function Section({
  eyebrow,
  children,
  className = "",
}: {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal as="section" className={`border-t border-line py-20 sm:py-28 ${className}`}>
      <h2 className="label-mono text-amber">{eyebrow}</h2>
      {children}
    </Reveal>
  );
}

/** First sentence-ish, for a teaser that must not run long. */
function excerpt(text: string, max = 240) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`;
}

/* 04 — The Architect ------------------------------------------------------ */

export function HomeArchitect({
  name,
  roleLine,
  portrait,
  biography,
}: {
  name?: string;
  roleLine?: string;
  portrait?: string;
  biography?: string;
}) {
  const n = (name ?? "").trim();
  const role = (roleLine ?? "").trim();
  const bio = (biography ?? "").trim();
  const img = (portrait ?? "").trim();

  // The portrait alone is not a section. Something readable has to be there.
  if (!n && !bio) return null;

  return (
    <Section eyebrow="The architect">
      <div className="mt-8 grid items-center gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
        {img ? (
          <Frame src={img} alt={n ? `${n}, portrait` : "Portrait"} ratio="4/5" tone={false} />
        ) : null}
        <div className={img ? "" : "md:col-span-2 md:max-w-3xl"}>
          {n ? <p className="display-title text-3xl text-ink sm:text-4xl">{n}</p> : null}
          {role ? <p className="label-mono mt-3">{role}</p> : null}
          {bio ? (
            <p className="mt-6 text-base leading-relaxed text-ink/90">{excerpt(bio)}</p>
          ) : null}
          <Link
            href="/studio/architect"
            className="link-underline label-mono mt-8 inline-block text-ink"
          >
            Read the full profile →
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* 05 — The Practice ------------------------------------------------------- */

export function HomePractice({
  headline,
  body,
  disciplines,
}: {
  headline?: string;
  body?: string;
  disciplines?: string[];
}) {
  const h = (headline ?? "").trim();
  const b = (body ?? "").trim();
  const list = (disciplines ?? []).map((d) => d.trim()).filter(Boolean);

  // The only section with no page behind it, and the only one with no other
  // source to fall back on — so all three fields empty means no section.
  if (!h && !b && list.length === 0) return null;

  return (
    <Section eyebrow="The practice">
      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:gap-16">
        <div>
          {h ? (
            <p className="display-title text-2xl leading-[1.2] text-ink sm:text-3xl">{h}</p>
          ) : null}
          {b ? (
            <div className={`space-y-5 text-base leading-relaxed text-ink/90 ${h ? "mt-6" : ""}`}>
              {b.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}
        </div>
        {list.length > 0 ? (
          <ul className="flex flex-col gap-0 self-start border-t border-line">
            {list.map((d) => (
              <li key={d} className="border-b border-line py-3 text-sm text-ink/90">
                {d}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  );
}

/* 06 — Philosophy --------------------------------------------------------- */

export function HomePhilosophy({
  note,
  statement,
}: {
  /** The purpose-written short note, if the profile carries one. */
  note?: string;
  /** The full statement, which is also what the link leads to. */
  statement?: string;
}) {
  // Identical precedence to the About page's philosophy block, deliberately:
  // one source, and a purpose-written excerpt wins over a truncated statement.
  const full = (statement ?? "").trim();
  const short = (note ?? "").trim() || full;
  if (!short) return null;

  return (
    <Section eyebrow="Philosophy" className="text-center">
      <blockquote className="mx-auto mt-8 max-w-3xl">
        <p className="display-title text-2xl leading-[1.3] text-ink sm:text-3xl">
          {excerpt(short, 320)}
        </p>
      </blockquote>
      {full ? (
        <Link
          href="/studio/philosophy"
          className="link-underline label-mono mt-8 inline-block text-ink"
        >
          Read the full philosophy →
        </Link>
      ) : null}
    </Section>
  );
}

/* 07 — Recognition -------------------------------------------------------- */

export type RecognitionItem = {
  slug: string;
  title: string;
  date: string;
  category: string;
};

export function HomeRecognition({
  items,
  awards,
}: {
  items: RecognitionItem[];
  /** Profile-scoped award lines, folded in only when they exist. */
  awards?: string[];
}) {
  const list = items.slice(0, 3);
  const extra = (awards ?? []).map((a) => a.trim()).filter(Boolean).slice(0, 3);
  if (list.length === 0 && extra.length === 0) return null;

  return (
    <Section eyebrow="Recognition">
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-sm text-mute">Selected awards and competitions.</p>
        {list.length > 0 ? (
          <Link href="/achievements" className="link-underline label-mono shrink-0 text-ink">
            See all
          </Link>
        ) : null}
      </div>

      {/*
        Numbered index rather than cards. The section above it is a paragraph
        and the one below is a feed, so a tabular treatment here keeps the three
        distinguishable at a glance.

        The order is the dashboard's own `order` field, which is what /achievements
        uses — not a recency sort. `date` is free text, so parsing a year out of it
        would work today and break the first time an entry reads "Spring 2026".
      */}
      <ol className="mt-8 border-t border-line">
        {list.map((item, i) => (
          <li key={item.slug} className="border-b border-line">
            <Link
              href={`/achievements/${item.slug}`}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5 sm:gap-6"
            >
              <span className="data-mono text-[11px] tracking-widest text-mute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-base text-ink transition-colors group-hover:text-amber">
                  {item.title}
                </span>
                {item.category ? (
                  <span className="label-mono mt-1 block">{item.category}</span>
                ) : null}
              </span>
              {item.date ? (
                <span className="data-mono shrink-0 text-[11px] tracking-widest text-mute">
                  {item.date}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>

      {extra.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-2">
          {extra.map((a) => (
            <li key={a} className="text-sm text-mute">
              {a}
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}

/* 08 — Latest ------------------------------------------------------------- */

export function HomeLatest({ entries }: { entries: NowEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <Section eyebrow="Latest">
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-sm text-mute">Recent activity from the studio.</p>
        <Link href="/now" className="link-underline label-mono shrink-0 text-ink">
          The Now page
        </Link>
      </div>
      {/*
        NowList is reused rather than reimplemented, so an entry with `details`
        opens the same popup here as it does on /now, and one without stays a
        plain item — the existing contract, not a second copy of it.
      */}
      <div className="mt-8">
        <NowList entries={entries} hideDates />
      </div>
    </Section>
  );
}
