import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ArchitectForm } from "@/components/admin/StudioForms";
import { ThemeToggle } from "@/components/hq/ThemeToggle";

export const dynamic = "force-dynamic";
export const metadata = { title: "The Architect — Pit Wall", robots: { index: false, follow: false } };

export default async function ArchitectDashboardPage() {
  const profile = await prisma.architectProfile.findUnique({ where: { id: "singleton" } });

  return (
    <div className="min-h-screen bg-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-amber"
          >
            <ArrowLeft aria-hidden className="h-3 w-3" />
            Overview
          </Link>
          <ThemeToggle />
        </div>
        <h1 className="display-title mt-4 text-4xl text-ink">The Architect</h1>
        <p className="mt-2 text-sm text-mute">
          Portrait, role, biography and credentials for /studio/architect.
        </p>

        <div className="mt-10">
          <ArchitectForm
            initial={{
              name: profile?.name ?? "",
              roleLine: profile?.roleLine ?? "",
              portrait: profile?.portrait ?? "",
              biography: profile?.biography ?? "",
              credentials: profile?.credentials ?? [],
            }}
          />
        </div>
      </div>
    </div>
  );
}
