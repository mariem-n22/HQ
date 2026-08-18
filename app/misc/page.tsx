import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { Frame } from "@/components/hq/Frame";
import { getContentBlocks, getMiscEntries, findBlock } from "@/lib/data";

export const metadata = {
  title: "Free Practice — Mahmoud HQ",
  description: "The grab bag: books, opinions, habits and everything that fits no other sector.",
};

export default async function MiscPage() {
  const [entries, blocks] = await Promise.all([getMiscEntries(), getContentBlocks()]);
  const block = findBlock(blocks, "misc_intro");

  return (
    <SectorPage>
      <SectorHeader sector="06" label="Free Practice" title={block?.title ?? "Free Practice"} intro={block?.body} />
      <div className="mt-10">
        {entries.length === 0 ? (
          <EmptyState what="entries" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {entries.map((entry) => (
              <article key={entry.id} className="glow-card flex h-full flex-col overflow-hidden">
                <Frame src={entry.image} alt={entry.title} ratio="16/9" tone={false} className="rounded-t-3xl border-0 border-b border-line" />
                <div className="flex-1 p-5">
                  <span aria-hidden className="text-2xl">{entry.emoji}</span>
                  <h2 className="display-title mt-3 text-2xl text-cyan">{entry.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{entry.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SectorPage>
  );
}
