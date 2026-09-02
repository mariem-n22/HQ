import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { STUDIO, SITE_URL, ONE_LINER } from "@/lib/seo";
import "./globals.css";

/**
 * The Architectural Archive pairing: an editorial serif for display, an
 * ultra-clean grotesque for everything the interface has to say. Exposed as
 * CSS variables so the --font-display / --font-sans tokens resolve.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-manrope",
});

/**
 * Runs before first paint, so a returning light-mode visitor never sees a
 * frame of dark. Deliberately not a module: it has to execute synchronously
 * in <head>, ahead of hydration and ahead of the body being painted.
 *
 * Dark is the product default, full stop — the archive is meant to be read
 * dark, and the photography is lit for it. `prefers-color-scheme` is
 * deliberately NOT consulted: an OS-level light preference is a preference
 * about operating systems, not about this site, and honouring it would show
 * most first-time visitors a mode the design does not lead with. Only an
 * explicit choice made here, on the toggle, overrides dark.
 */
const THEME_INIT = `(function(){try{var s=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',s==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

/**
 * Nav visibility depends on database content, so the public pages must not be
 * frozen at deploy time.
 *
 * The primary mechanism is on-demand: every CMS write calls
 * revalidatePath("/", "layout"), so saving the first project or the Philosophy
 * statement invalidates every prerendered page immediately. This value is the
 * safety net underneath it — content changed outside the dashboard (a direct
 * database edit, a restored backup) still surfaces within the window instead
 * of waiting for the next deploy.
 *
 * As a route-segment default on the root layout it applies to every page
 * beneath it, which is exactly the set that renders the nav.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Every page anchors on the name — it is the primary query family.
    default: `${STUDIO.name} — selected projects`,
    template: `%s | ${STUDIO.name}`,
  },
  description: ONE_LINER,
  applicationName: STUDIO.name,
  authors: [{ name: STUDIO.name, url: SITE_URL }],
  creator: STUDIO.name,
  publisher: STUDIO.name,
  // Discipline and typology terms only. The previous list named a real
  // individual, his companies and his university; none of that is true of an
  // architecture studio, and inventing replacements would be worse than none.
  keywords: [
    "architecture studio",
    "architecture practice",
    "architectural design",
    "residential architecture",
    "cultural architecture",
    "hospitality architecture",
    "urban design",
    "interior architecture",
    "landscape architecture",
  ],
  icons: { icon: "/favicon.ico" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // The pre-paint script sets data-theme before React sees the document,
      // so the server markup and the first client render disagree by design.
      suppressHydrationWarning
      data-theme="dark"
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="bg-base text-ink antialiased">{children}</body>
    </html>
  );
}
