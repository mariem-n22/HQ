import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { IdentityTimeline } from "@/components/hq/IdentityTimeline";
import { getContentBlocks, getIdentityMoments, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Identity",
  description: "What shapes the way the studio designs.",
  path: "/identity",
});

export default async function IdentityPage() {
  const [moments, blocks] = await Promise.all([getIdentityMoments(), getContentBlocks()]);
  const block = findBlock(blocks, "identity_intro");

  return (
    <SectorPage>
      <SectorHeader sector="04" label="Identity" title={block?.title ?? "Identity"} intro={block?.body} />
      <div className="mt-10">
        {moments.length === 0 ? (
          <EmptyState what="moments" />
        ) : (
          <IdentityTimeline moments={moments} />
        )}
      </div>
    </SectorPage>
  );
}
