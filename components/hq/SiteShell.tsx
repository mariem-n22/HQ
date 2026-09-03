import Link from "next/link";
import type { ReactNode } from "react";
import { NAV_GROUPS } from "@/lib/types";
import { STUDIO } from "@/lib/seo";
import { getNavPresence, getNowEntries, getSettings } from "@/lib/data";
import { CurrentlyLine } from "./TelemetryTicker";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav, NavDropdown } from "./NavMenu";

const navLinkClass =
  "link-underline whitespace-nowrap text-[13px] tracking-wide text-mute transition-colors hover:text-ink";

/**
 * Site chrome: nav, the Currently line, and the footer. A Server Component, so
 * it pulls the two things the chrome itself needs rather than making every
 * page thread them through.
 */
/**
 * `hasHero` says this page opens with a full-bleed hero.
 *
 * The Currently line normally sits directly under the nav, which is the right
 * place on a page that opens with a heading. Above a hero it is wrong: it
 * wedges a bordered bar between the navbar and the photograph, so the hero
 * stops being the first thing on the page and the bar reads as a banner
 * pinned over it.
 *
 * On those pages it is dropped altogether. It was briefly moved to the foot
 * instead, but the home page now carries a "Latest" section reading the same
 * Now entries and linking to the same page, so the bar was saying a second time
 * what the section above it had already said. A page that opens with a hero
 * does not need a standing dispatch line as well.
 *
 * It is a rule about page shape rather than a list of routes, so any future
 * hero page gets the right behaviour by declaring itself one, and every page
 * that opens with a heading keeps the line under the nav where it belongs.
 */
export async function SiteShell({
  children,
  hasHero = false,
}: {
  children: ReactNode;
  hasHero?: boolean;
}) {
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

  // A group keeps only its populated children, and drops out entirely when
  // none survive — so "Studio" appears the moment either The Architect or
  // Philosophy has real content, listing just the one that does.
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    children: group.children.filter((child) => show(child.to)),
  })).filter((group) => group.children.length > 0);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-base">
      <header className="sticky top-0 z-40 border-b border-line bg-base/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:gap-6 sm:px-8">
          <Link
            href="/"
            // Steps down on small screens so the row still fits the Portfolio
            // button, the theme toggle and the menu trigger without the last
            // of them being clipped off the edge.
            className="display-title min-w-0 truncate text-lg text-ink transition-colors hover:text-amber sm:text-2xl"
          >
            {STUDIO.name}
          </Link>
          <nav
            aria-label="Sections"
            className="hidden flex-1 items-center justify-center gap-6 lg:flex"
          >
            {groups.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
            <Link href="/contact" className={navLinkClass}>
              Contact
            </Link>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/portfolio"
              className="shrink-0 rounded-full border border-line px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:border-amber hover:text-amber"
            >
              Portfolio
            </Link>
            <ThemeToggle />
            <MobileNav groups={groups} />
          </div>
        </div>
      </header>

      {hasHero ? null : <CurrentlyLine entries={nowEntries} />}

      <main className="flex-1">{children}</main>


      <footer className="mt-28 border-t border-line">
        {/*
          Explicit track counts, not `auto-fit`.
          
          This previously read `grid-cols-[1.6fr_repeat(auto-fit,minmax(8rem,1fr))]`,
          which is invalid: `repeat(auto-fit, …)` may not appear in a track list
          that also carries a flexible `fr` track outside the repeat. The whole
          declaration was therefore discarded and the footer collapsed to a
          single implicit column at every width.

          The studio block spans two tracks so the tagline keeps a readable
          measure, and each nav group takes one — six across at `lg`, folding
          to four and then two as the space runs out.
        */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 px-6 py-16 sm:px-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <p className="display-title text-3xl text-ink">{STUDIO.name}</p>
            <p className="standfirst mt-4 max-w-sm text-[15px]">
              An archive of selected projects, kept current by the studio.
            </p>
            <SocialLinks settings={settings} className="mt-6" />
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
        </div>

        {/*
          Contact, the single-page portfolio and the editor sat in a sixth
          column called "Elsewhere", which pushed the grid past what 1088px
          can hold as equal columns. They are secondary links about the site
          rather than sections of it, so they belong on the bottom rule.
        */}
        <div className="border-t border-line px-6 py-5 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] uppercase tracking-[0.25em] text-mute">
              © {new Date().getFullYear()} {STUDIO.name}
            </p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <li>
                <Link href="/contact" className="link-underline text-sm text-mute hover:text-ink">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="link-underline text-sm text-mute hover:text-ink">
                  Portfolio (single page)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="link-underline text-sm text-mute hover:text-ink">
                  Editor
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function SectorPage({
  children,
  hasHero = false,
}: {
  children: ReactNode;
  hasHero?: boolean;
}) {
  return (
    <SiteShell hasHero={hasHero}>
      {/* A hero breaks out of this column and wants to meet the nav, so the
          top padding is dropped when one is present. */}
      <div
        className={`mx-auto max-w-6xl px-6 pb-16 sm:px-8 sm:pb-24 ${hasHero ? "" : "pt-16 sm:pt-24"}`}
      >
        {children}
      </div>
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
