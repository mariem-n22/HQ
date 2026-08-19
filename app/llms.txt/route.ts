import { buildLlmsTxt } from "@/lib/llms";

export const dynamic = "force-dynamic";

/**
 * Served as text/plain so agents and humans both get raw Markdown rather than
 * a download prompt or a rendered page.
 */
export async function GET() {
  return new Response(await buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
