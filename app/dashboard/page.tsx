import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/hq/ThemeToggle";

export const metadata = {
  title: "Studio dashboard",
  robots: { index: false, follow: false },
};

/**
 * Dashboard overview. Route protection lives in proxy.ts, so reaching this at
 * all means the session is valid; the counts confirm the Prisma read path.
 */
export default async function DashboardPage() {
  const session = await auth();

  const [projects, skills, experiences, achievements, identity, ventures, misc, now, books, certifications, messages] =
    await Promise.all([
      prisma.project.count(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.achievement.count(),
      prisma.identityMoment.count(),
      prisma.venture.count(),
      prisma.miscEntry.count(),
      prisma.nowEntry.count(),
      prisma.book.count(),
      prisma.certification.count(),
      prisma.contactMessage.count(),
    ]);

  // Every tile links into its management screen — PART 2.
  const tiles: { label: string; value: number | string; href: string }[] = [
    { label: "Projects", value: projects, href: "/dashboard/projects" },
    { label: "Skills", value: skills, href: "/dashboard/skills" },
    { label: "Experience", value: experiences, href: "/dashboard/experience" },
    { label: "Achievements", value: achievements, href: "/dashboard/achievements" },
    { label: "Identity moments", value: identity, href: "/dashboard/identity" },
    { label: "Ventures", value: ventures, href: "/dashboard/ventures" },
    { label: "Misc entries", value: misc, href: "/dashboard/misc" },
    { label: "Now entries", value: now, href: "/dashboard/now" },
    { label: "Books", value: books, href: "/dashboard/books" },
    { label: "Certifications", value: certifications, href: "/dashboard/certifications" },
    { label: "Inbox", value: messages, href: "/dashboard/inbox" },
    { label: "The Architect", value: "—", href: "/dashboard/architect" },
    { label: "Philosophy", value: "—", href: "/dashboard/philosophy" },
    { label: "Settings", value: "—", href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label-mono text-amber">Pit Wall</p>
            <h1 className="display-title mt-2 text-4xl text-ink">Overview</h1>
            <p className="mt-2 text-sm text-mute">Signed in as {session?.user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-sm border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:border-amber hover:text-amber"
            >
              View site
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/dashboard/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-sm border border-signal/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-on-signal"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Link key={tile.label} href={tile.href} className="glow-card block px-4 py-5">
              <p className="display-title text-3xl text-ink">{tile.value}</p>
              <p className="label-mono mt-2">{tile.label}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                Manage →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
