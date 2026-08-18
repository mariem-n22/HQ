import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { getContentBlocks, getNowEntries, findBlock } from "@/lib/data";

export const metadata = {
  title: "Now — Mahmoud HQ",
  description: "What this week actually looks like: what I'm building, reading and chasing.",
};

export default async function NowPage() {
  const [entries, blocks] = await Promise.all([getNowEntries(), getContentBlocks()]);
  const block = findBlock(blocks, "now_intro");

  return (
    <SectorPage>
      <SectorHeader sector="07" label="Now" title={block?.title ?? "Now"} intro={block?.body} />
      <div className="mt-10">
        {entries.length === 0 ? (
          <EmptyState what="now entries" />
        ) : (
          <ul className="grid gap-4">
            {entries.map((entry) => (
              <li key={entry.id} className="glow-card flex gap-4 p-5">
                <span
                  aria-hidden
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${entry.active ? "pulse-pip bg-go" : "bg-line"}`}
                />
                <div className="min-w-0">
                  <p className="data-mono text-[11px] tracking-widest">
                    {entry.date.toISOString().slice(0, 10)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/90">{entry.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectorPage>
  );
}
