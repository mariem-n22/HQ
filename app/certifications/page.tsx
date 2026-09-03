import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage, EmptyState } from "@/components/hq/SiteShell";
import { SectorHeader } from "@/components/hq/SectorHeader";
import { CertificationList } from "@/components/hq/CertificationList";
import { getCertifications, getContentBlocks, findBlock } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Certifications",
  description:
    "Credentials and certifications held by Mariem Nasser Elsbelgy, with links to verify each one.",
  path: "/certifications",
});

export default async function CertificationsPage() {
  const [certifications, blocks] = await Promise.all([getCertifications(), getContentBlocks()]);
  const block = findBlock(blocks, "certifications_intro");

  return (
    <SectorPage>
      <SectorHeader
        sector="09"
        label="Certifications"
        title={block?.title ?? "Certifications"}
        intro={block?.body ?? "Courses and certifications, each linking to where it can be verified."}
      />
      <div className="mt-10">
        {certifications.length === 0 ? (
          <EmptyState what="certifications" />
        ) : (
          <CertificationList certifications={certifications} />
        )}
      </div>
    </SectorPage>
  );
}
