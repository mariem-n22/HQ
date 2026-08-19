import type { Json } from "@/lib/seo";

/**
 * JSON-LD is emitted as a script tag in the rendered HTML so crawlers see it
 * without executing anything. Server Component — no client cost.
 */
export function JsonLd({ data }: { data: Json }) {
  return (
    <script
      type="application/ld+json"
      // Content is generated server-side from our own constants, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
