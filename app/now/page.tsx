import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { getContentBlocks, getNowEntries, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "What the studio is working on now",
  description: "Current work, in progress.",
  path: "/now",
});

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
                  {/* Optional by design — nothing is rendered when absent, unlike
                      covers and galleries which always reserve a placeholder. */}
                  {entry.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.image}
                      alt=""
                      loading="lazy"
                      className="mt-3 max-h-56 w-full rounded-sm border border-line object-cover sm:max-w-sm"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectorPage>
  );
}
