/**
 * Signature Statement — the quiet block between the hero and the work.
 *
 * Text-only: it is a pause, not a teaser, so it carries no images, links or
 * calls to action that would pull the reader sideways before they reach the
 * projects.
 *
 * The padding matches the rest of the site's sections (py-16 sm:py-24) rather
 * than the py-28/py-40 it started with. That was chosen for a full statement
 * and left the placeholder — a headline and two lines — stranded in roughly
 * 220px of empty ground, which reads as a broken section rather than a
 * spacious one. A pause should be sized to what is in it.
 *
 * Both fields are the studio's own words. With neither filled the section
 * renders an unmistakable placeholder rather than any invented headline —
 * and with only one filled it renders just that one, so a half-written
 * section is short rather than broken.
 */
export function SignatureStatement({
  headline,
  body,
}: {
  headline?: string;
  body?: string;
}) {
  const title = (headline ?? "").trim();
  const text = (body ?? "").trim();

  return (
    <section aria-label="Statement" className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
      {title || text ? (
        <div className="max-w-3xl">
          {title ? (
            <h2 className="display-title text-3xl leading-[1.15] text-ink sm:text-5xl">{title}</h2>
          ) : null}
          {text ? (
            <div className={`space-y-5 text-base leading-relaxed text-ink/90 ${title ? "mt-8" : ""}`}>
              {text.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="max-w-xl border border-dashed border-line bg-surface p-6">
          <p className="label-mono text-amber">Signature statement</p>
          <p className="mt-3 text-sm text-mute">
            Not written yet. Add a headline and a short statement or quote under{" "}
            <span className="text-ink">Dashboard → Settings</span>. This should be the architect&rsquo;s
            own words.
          </p>
        </div>
      )}
    </section>
  );
}
