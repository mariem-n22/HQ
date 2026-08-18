/**
 * Card copy for the condensed Experience / Identity cards: the explicit
 * `summary` when one has been written, otherwise the opening sentences of the
 * full description so a card is never blank (and so the pattern works before
 * the v4 migration adds the column).
 */
export function summarize(
  item: { summary?: string | null; description?: string | null },
  sentences = 2,
) {
  const explicit = (item.summary ?? "").trim();
  if (explicit) return explicit;
  const description = item.description ?? "";
  const opening = description
    .split(/(?<=[.!?])\s+/)
    .slice(0, sentences)
    .join(" ");
  return opening || description;
}
