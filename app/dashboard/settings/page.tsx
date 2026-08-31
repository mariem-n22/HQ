import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ThemeToggle } from "@/components/hq/ThemeToggle";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — Pit Wall", robots: { index: false, follow: false } };

export default async function SettingsPage() {
  const [settings, heroImages] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.heroImage.findMany({ orderBy: { order: "asc" } }),
  ]);

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
        <h1 className="display-title mt-4 text-4xl text-ink">Settings</h1>
        <p className="mt-2 text-sm text-mute">
          Hero gallery, CV, contact channels and the availability badge.
        </p>

        <div className="mt-10">
          <SettingsForm
            settings={{
              email: settings?.email ?? "",
              phone: settings?.phone ?? "",
              whatsapp: settings?.whatsapp ?? "",
              linkedin: settings?.linkedin ?? "",
              github: settings?.github ?? "",
              instagram: settings?.instagram ?? "",
              location: settings?.location ?? "",
              availability: settings?.availability ?? "",
              philosophyQuote: settings?.philosophyQuote ?? "",
              openToOpportunities: settings?.openToOpportunities ?? true,
              avatarImage: settings?.avatarImage ?? "",
              heroImage: settings?.heroImage ?? "",
              cvUrl: settings?.cvUrl ?? "",
              cvUpdatedAt: settings?.cvUpdatedAt?.toISOString() ?? null,
            }}
            heroImages={heroImages.map((h) => ({ url: h.url, caption: h.caption, alt: h.alt }))}
          />
        </div>
      </div>
    </div>
  );
}
