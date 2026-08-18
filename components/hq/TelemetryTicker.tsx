import Link from "next/link";
import type { NowEntry } from "@/lib/types";

/**
 * Quiet editorial dispatch line under the nav — the current Now entry, or a
 * standing fallback when nothing is marked active.
 */
export function CurrentlyLine({
  entries,
  bordered = true,
}: {
  entries: NowEntry[];
  bordered?: boolean;
}) {
  const current = entries.find((entry) => entry.active)?.text;

  return (
    <div className={bordered ? "border-y border-line" : ""}>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4 sm:px-8">
        <span className="flex items-center gap-2">
          <span aria-hidden className="pulse-pip h-1.5 w-1.5 rounded-full bg-amber" />
          <span className="label-mono text-amber">Currently</span>
        </span>
        <p className="min-w-0 text-sm leading-relaxed text-mute sm:flex-1 sm:basis-64">
          {current ?? "Building, reading and writing from Cairo."}
        </p>
        <Link href="/now" className="link-underline label-mono text-ink">
          The Now page
        </Link>
      </div>
    </div>
  );
}
