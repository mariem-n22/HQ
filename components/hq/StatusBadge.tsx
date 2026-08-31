const map: Record<string, string> = {
  // Architecture project lifecycle.
  CONCEPT: "text-amber",
  COMPETITION: "text-amber",
  UNDER_CONSTRUCTION: "text-amber",
  COMPLETED: "text-go",
  UNBUILT: "text-mute",
  // Retained so any legacy value still renders rather than falling through.
  BUILDING: "text-amber",
  SHIPPED: "text-go",
  ARCHIVED: "text-mute",
  Active: "text-go",
  Exploring: "text-amber",
  Researching: "text-amber",
  Shelved: "text-mute",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] ${
        map[status] ?? "text-mute"
      }`}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}
