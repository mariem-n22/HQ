import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";
import { PERSON, SITE_URL, ONE_LINER } from "@/lib/seo";
import "./globals.css";

// The Pit Wall type pairing, carried over unchanged. Exposed as CSS variables
// so the existing --font-display / --font-sans tokens in globals.css resolve.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Every page anchors on the name — it is the primary query family.
    default: `${PERSON.name} — Engineer, founder, racing driver`,
    template: `%s | ${PERSON.name}`,
  },
  description: ONE_LINER,
  applicationName: "Mahmoud HQ",
  authors: [{ name: PERSON.name, url: SITE_URL }],
  creator: PERSON.name,
  publisher: PERSON.name,
  keywords: [
    "Mahmoud Hammad",
    "Mahmoud Hamaad",
    "BMawy",
    "T1Dub",
    "DeepClone",
    "WorkPo",
    "Egyptian software engineer",
    "Egyptian AI founder",
    "Egyptian racing driver",
    "Formula 1",
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
    <html lang="en" className={`${instrumentSerif.variable} ${workSans.variable}`}>
      <body className="bg-base text-ink antialiased">{children}</body>
    </html>
  );
}
