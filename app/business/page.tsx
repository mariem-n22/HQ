import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { Frame } from "@/components/hq/Frame";
import { getContentBlocks, getVentures, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Ventures",
  description: "The practice's business side — ventures, structure and where it is heading.",
  path: "/business",
});

export default async function BusinessPage() {
  const [ventures, blocks] = await Promise.all([getVentures(), getContentBlocks()]);
  const block = findBlock(blocks, "business_intro");

  return (
    <SectorPage>
      <SectorHeader sector="05" label="Business" title={block?.title ?? "Business"} intro={block?.body} />
      <div className="mt-10">
        {ventures.length === 0 ? (
          <EmptyState what="ventures" />
        ) : (
          <ul className="grid gap-4">
            {ventures.map((venture) => (
              <li key={venture.id} className="glow-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <Frame src={venture.image} alt={`${venture.name} mark`} ratio="4/3" tone={false} className="w-full shrink-0 rounded-md sm:w-40" />
                <div className="flex-1">
                  <h3 className="display-title text-2xl text-ink">{venture.name}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mute">
                    {venture.status}
                    {venture.jurisdiction ? ` · ${venture.jurisdiction}` : ""}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-mute">{venture.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectorPage>
  );
}
