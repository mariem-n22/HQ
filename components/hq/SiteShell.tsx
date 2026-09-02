import Link from "next/link";
import type { ReactNode } from "react";
import { NAV_GROUPS, SECTORS } from "@/lib/types";
import { STUDIO } from "@/lib/seo";
import { getNavPresence, getNowEntries, getSettings } from "@/lib/data";
import { CurrentlyLine } from "./TelemetryTicker";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass =
  "link-underline whitespace-nowrap text-[13px] tracking-wide text-mute transition-colors hover:text-ink";

/**
 * Site chrome: nav, the Currently line, and the footer. A Server Component, so
 * it pulls the two things the chrome itself needs rather than making every
 * page thread them through.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const [settings, nowEntries, present] = await Promise.all([
    getSettings(),
    getNowEntries(),
    getNavPresence(),
  ]);

  // A nav entry only appears once its section has something behind it, so the
  // studio never links visitors to a blank page while the site is being
  // filled in. `present` is empty on a degraded build, and an unknown route
  // defaults to visible — losing the navigation entirely would be worse than
  // showing one empty page.
  const show = (to: string) => present[to] !== false;
  const sectors = SECTORS.filter((sector) => show(sector.to));

  // A group keeps only its populated children, and drops out entirely when
  // none survive — so "Studio" appears the moment either The Architect or
  // Philosophy has real content, listing just the one that does.
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    children: group.children.filter((child) => show(child.to)),
  })).filter((group) => group.children.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="sticky top-0 z-40 border-b border-line bg-base/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5 sm:px-8">
          <Link
            href="/"
            className="display-title shrink-0 text-2xl text-ink transition-colors hover:text-amber"
          >
            {STUDIO.name}
          </Link>
          <nav
            aria-label="Sections"
            className="hidden flex-1 items-center justify-center gap-6 lg:flex"
          >
            {sectors.map((sector) => (
              <Link key={sector.to} href={sector.to} className={navLinkClass}>
                {sector.label}
              </Link>
            ))}
            {groups.map((group) => (
              <div key={group.label} className="group relative">
                <span
                  className="cursor-default whitespace-nowrap text-[13px] tracking-wide text-mute transition-colors group-hover:text-ink group-focus-within:text-ink"
                  aria-hidden
                >
                  {group.label}
                </span>
                {/*
                  Hover/focus reveals the children, but they stay in the DOM
                  and in the tab order at all times — a keyboard or screen
                  reader user never depends on a hover to reach them.
                */}
                <div
                  role="group"
                  aria-label={group.label}
                  className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-3 group-hover:block group-focus-within:block"
                >
                  <div className="flex flex-col gap-2 border border-line bg-surface px-4 py-3 shadow-lg">
                    {group.children.map((child) => (
                      <Link key={child.to} href={child.to} className={navLinkClass}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Link href="/contact" className={navLinkClass}>
              Contact
            </Link>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <Link
              href="/portfolio"
              className="shrink-0 rounded-full border border-line px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:border-amber hover:text-amber"
            >
              Portfolio
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <nav
          aria-label="Sections (compact)"
          className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-6 py-3 lg:hidden"
        >
          {sectors.map((sector) => (
            <Link key={sector.to} href={sector.to} className={navLinkClass}>
              {sector.label}
            </Link>
          ))}
          {/* No hover on touch, so the group is flattened rather than hidden
              behind a disclosure the visitor cannot open. */}
          {groups.flatMap((group) =>
            group.children.map((child) => (
              <Link key={child.to} href={child.to} className={navLinkClass}>
                {child.label}
              </Link>
            )),
          )}
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
        </nav>
      </header>

      <CurrentlyLine entries={nowEntries} />

      <main className="flex-1">{children}</main>

      <footer className="mt-28 border-t border-line">
        {/* Column count follows the number of link lists, since a nav group
            only exists when it has content. */}
        <div
          className={`mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-8 ${
            groups.length > 0 ? "md:grid-cols-[1.4fr_1fr_1fr_1fr]" : "md:grid-cols-[1.4fr_1fr_1fr]"
          }`}
        >
          <div>
            <p className="display-title text-3xl text-ink">{STUDIO.name}</p>
            <p className="standfirst mt-4 max-w-sm text-[15px]">
              An archive of selected projects, kept current by the studio.
            </p>
            <SocialLinks settings={settings} className="mt-6" />
          </div>
          <div>
            <p className="label-mono">Sections</p>
            <ul className="mt-5 space-y-2.5">
              {sectors.map((sector) => (
                <li key={sector.to}>
                  <Link href={sector.to} className="link-underline text-sm text-mute hover:text-ink">
                    {sector.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {groups.map((group) => (
            <div key={group.label}>
              <p className="label-mono">{group.label}</p>
              <ul className="mt-5 space-y-2.5">
                {group.children.map((child) => (
                  <li key={child.to}>
                    <Link href={child.to} className="link-underline text-sm text-mute hover:text-ink">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="label-mono">Elsewhere</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="link-underline text-mute hover:text-ink">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="link-underline text-mute hover:text-ink">
                  Portfolio (single page)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="link-underline text-mute hover:text-ink">
                  Editor
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line px-6 py-5 sm:px-8">
          <p className="mx-auto max-w-6xl text-[11px] uppercase tracking-[0.25em] text-mute">
            © {new Date().getFullYear()} {STUDIO.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function SectorPage({ children }: { children: ReactNode }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">{children}</div>
    </SiteShell>
  );
}

export function EmptyState({ what }: { what: string }) {
  return (
    <div className="rounded-sm border border-dashed border-line bg-surface p-8 text-center">
      <p className="text-sm text-mute">Nothing filed under {what} yet.</p>
    </div>
  );
}
