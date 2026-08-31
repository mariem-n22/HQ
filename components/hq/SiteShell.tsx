import Link from "next/link";
import type { ReactNode } from "react";
import { SECTORS, STUDIO_LINKS } from "@/lib/types";
import { getNowEntries, getSettings } from "@/lib/data";
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
  const [settings, nowEntries] = await Promise.all([getSettings(), getNowEntries()]);

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="sticky top-0 z-40 border-b border-line bg-base/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5 sm:px-8">
          <Link
            href="/"
            className="display-title shrink-0 text-2xl text-ink transition-colors hover:text-amber"
          >
            Mahmoud
            <span className="ml-1 align-super text-[10px] uppercase tracking-[0.3em] text-amber">
              HQ
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden flex-1 items-center justify-center gap-6 lg:flex"
          >
            {SECTORS.map((sector) => (
              <Link key={sector.to} href={sector.to} className={navLinkClass}>
                {sector.label}
              </Link>
            ))}
            {STUDIO_LINKS.map((link) => (
              <Link key={link.to} href={link.to} className={navLinkClass}>
                {link.label}
              </Link>
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
          {SECTORS.map((sector) => (
            <Link key={sector.to} href={sector.to} className={navLinkClass}>
              {sector.label}
            </Link>
          ))}
          {STUDIO_LINKS.map((link) => (
            <Link key={link.to} href={link.to} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
        </nav>
      </header>

      <CurrentlyLine entries={nowEntries} />

      <main className="flex-1">{children}</main>

      <footer className="mt-28 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="display-title text-3xl text-ink">Mahmoud HQ</p>
            <p className="standfirst mt-4 max-w-sm text-[15px]">
              A home base, not a display case. Written, built and kept current from Cairo.
            </p>
            <SocialLinks settings={settings} className="mt-6" />
          </div>
          <div>
            <p className="label-mono">Sections</p>
            <ul className="mt-5 space-y-2.5">
              {SECTORS.map((sector) => (
                <li key={sector.to}>
                  <Link href={sector.to} className="link-underline text-sm text-mute hover:text-ink">
                    {sector.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
                  Portfolio (shareable)
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
            © {new Date().getFullYear()} Mahmoud — Cairo, EG
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
