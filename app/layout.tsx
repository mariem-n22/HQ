import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";
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
  title: "Mahmoud HQ — Engineer, founder, Cairo",
  description:
    "A personal home base — not a portfolio. Full-stack engineer and founder in Cairo.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${workSans.variable}`}>
      <body className="bg-base text-ink antialiased">{children}</body>
    </html>
  );
}
