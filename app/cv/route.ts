import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Stable public CV URL. Streams the current Blob file under a human filename
 * so the browser saves "Studio-Profile.pdf" rather than a hashed key, and
 * so the public link never changes when the CV is replaced.
 */
export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings?.cvUrl) {
    return new NextResponse("No CV published yet.", { status: 404 });
  }

  const upstream = await fetch(settings.cvUrl);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("CV is unavailable.", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      // `inline` opens in the browser's PDF viewer; the name is used on save.
      "Content-Disposition": 'inline; filename="Studio-Profile.pdf"',
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
