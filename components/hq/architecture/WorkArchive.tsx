"use client";

import { useMemo, useState } from "react";
import { STATUS_LABELS, TYPOLOGY_LABELS } from "@/lib/types";
import { ArchiveCard, type ArchiveEntry } from "./ArchiveCard";

type FacetKey = "typology" | "location" | "year" | "status";

const FACETS: { key: FacetKey; label: string; labels?: Record<string, string> }[] = [
  { key: "typology", label: "Type", labels: TYPOLOGY_LABELS },
  { key: "location", label: "Location" },
  { key: "year", label: "Year" },
  { key: "status", label: "Status", labels: STATUS_LABELS },
];

/**
 * The archive with its filter bar.
 *
 * Every facet is derived from the projects actually present, so a typology
 * with no projects never appears as a dead chip — the studio does not have to
 * curate the filter list, it curates the work. A facet with fewer than two
 * distinct values is dropped entirely: a "Location" row offering one location
 * filters nothing and is just furniture.
 *
 * Deliberately not a faceted-search UI. Single-select per facet, one clear
 * reset, no counts, no checkboxes, no drawer. This is a boutique archive.
 */
export function WorkArchive({ entries }: { entries: ArchiveEntry[] }) {
  const [active, setActive] = useState<Partial<Record<FacetKey, string>>>({});

  const facets = useMemo(() => {
    return FACETS.map((facet) => {
      const values = Array.from(
        new Set(
          entries
            .map((e) => (e[facet.key] ?? "") as string)
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      );
      // Years read newest-first; everything else alphabetically by its label.
      values.sort((a, b) =>
        facet.key === "year"
          ? b.localeCompare(a, undefined, { numeric: true })
          : (facet.labels?.[a] ?? a).localeCompare(facet.labels?.[b] ?? b),
      );
      return { ...facet, values };
    }).filter((facet) => facet.values.length > 1);
  }, [entries]);

  const shown = useMemo(
    () =>
      entries.filter((entry) =>
        FACETS.every((facet) => {
          const want = active[facet.key];
          return !want || ((entry[facet.key] ?? "") as string) === want;
        }),
      ),
    [entries, active],
  );

  const activeCount = Object.values(active).filter(Boolean).length;

  function toggle(key: FacetKey, value: string) {
    setActive((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  return (
    <div>
      {facets.length > 0 ? (
        <div className="border-y border-line py-5">
          <div className="flex flex-col gap-4">
            {facets.map((facet) => (
              <div key={facet.key} className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <span className="label-mono w-20 shrink-0">{facet.label}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {facet.values.map((value) => {
                    const on = active[facet.key] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggle(facet.key, value)}
                        aria-pressed={on}
                        className={`min-h-[44px] py-2 text-[13px] transition-colors ${
                          on
                            ? "text-amber underline decoration-amber underline-offset-[6px]"
                            : "text-mute hover:text-ink"
                        }`}
                      >
                        {facet.labels?.[value] ?? value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p aria-live="polite" className="label-mono">
              {shown.length} {shown.length === 1 ? "project" : "projects"}
            </p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={() => setActive({})}
                className="min-h-[44px] text-[13px] text-mute transition-colors hover:text-amber"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="mt-10 border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm text-mute">No projects match those filters.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((entry, i) => (
            <ArchiveCard key={entry.id} entry={entry} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
