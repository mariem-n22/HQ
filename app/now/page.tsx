import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { NowList } from "@/components/hq/NowList";
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
          <NowList entries={entries} />
        )}
      </div>
    </SectorPage>
  );
}
