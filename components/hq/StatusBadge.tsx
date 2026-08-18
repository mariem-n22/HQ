const map: Record<string, string> = {
  BUILDING: "text-amber",
  SHIPPED: "text-go",
  ARCHIVED: "text-mute",
  Active: "text-go",
  Exploring: "text-amber",
  Researching: "text-cyan",
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
