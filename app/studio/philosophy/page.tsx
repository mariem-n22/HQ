import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage } from "@/components/hq/SiteShell";
import { getPhilosophy } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Philosophy",
  description: "The practice's design position.",
  path: "/studio/philosophy",
});

/**
 * Philosophy — intentionally the least structured page on the site.
 *
 * A statement set large enough to read as a pull-quote, and optional
 * supporting paragraphs beneath it. Nothing else: over-building this template
 * would work against what the page is for.
 */
export default async function PhilosophyPage() {
  const philosophy = await getPhilosophy();
  const statement = (philosophy?.statement ?? "").trim();
  const body = (philosophy?.body ?? "").trim();

  return (
    <SectorPage>
      <p className="label-mono text-amber">Studio</p>

      {statement ? (
        <>
          {/*
            Screen-reader only, and only on this branch.

            The statement is the page's display element and a visible "Philosophy"
            heading above a full-bleed pull quote would change the design, so the
            page carried no h1 at all once a statement existed — the quote is a
            <p> inside a blockquote, which is not a heading to assistive tech.
            Every other page on the site announces itself with a real heading;
            this gives this one the same landmark without altering what is drawn.

            The empty state below has its own visible h1, so this must not be
            rendered there or the page would have two.
          */}
          <h1 className="sr-only">Philosophy</h1>
          <blockquote className="mt-10 max-w-4xl">
            <p className="display-title text-4xl leading-[1.15] text-ink sm:text-6xl">
              {statement}
            </p>
          </blockquote>
        </>
      ) : (
        <div className="mt-10 max-w-2xl">
          <h1 className="display-title text-4xl text-ink sm:text-5xl">Philosophy</h1>
          <div className="mt-6 border border-dashed border-line bg-surface p-6">
            <p className="text-sm text-mute">
              The statement has not been written yet. Add it under{" "}
              <span className="text-ink">Dashboard → Philosophy</span>.
            </p>
          </div>
        </div>
      )}

      {body ? (
        <div className="mt-14 max-w-2xl space-y-5 border-t border-line pt-10 text-base leading-relaxed text-ink/90">
          {body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      ) : null}
    </SectorPage>
  );
}
