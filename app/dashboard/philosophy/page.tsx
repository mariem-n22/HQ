import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PhilosophyForm } from "@/components/admin/StudioForms";
import { ThemeToggle } from "@/components/hq/ThemeToggle";

export const dynamic = "force-dynamic";
export const metadata = { title: "Philosophy — Pit Wall", robots: { index: false, follow: false } };

export default async function PhilosophyDashboardPage() {
  const philosophy = await prisma.philosophy.findUnique({ where: { id: "singleton" } });

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
        <h1 className="display-title mt-4 text-4xl text-ink">Philosophy</h1>
        <p className="mt-2 text-sm text-mute">The manifesto shown on /studio/philosophy.</p>

        <div className="mt-10">
          <PhilosophyForm
            initial={{
              statement: philosophy?.statement ?? "",
              body: philosophy?.body ?? "",
              image: philosophy?.image ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
