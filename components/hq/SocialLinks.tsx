import { channelsOf } from "@/lib/channels";
import type { SiteSettings } from "@/lib/data";

/** Compact icon row — footer, portfolio header. */
export function SocialLinks({
  settings,
  className = "",
  size = "md",
}: {
  settings: SiteSettings | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const channels = channelsOf(settings).filter(
    (c) => c.key !== "phone" && c.key !== "email",
  );
  if (channels.length === 0) return null;
  const box = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const glyph = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {channels.map(({ key, label, href, Icon, hover }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className={`flex ${box} items-center justify-center rounded-sm border border-line text-mute transition-colors hover:border-amber/60 ${hover}`}
          >
            <Icon aria-hidden className={glyph} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Full list with labels and values — /contact and the portfolio footer. */
export function ContactChannels({ settings }: { settings: SiteSettings | null }) {
  const channels = channelsOf(settings);

  if (channels.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-surface p-8 text-center">
        <p className="text-sm text-mute">
          No channels published yet — add them under Settings in the dashboard.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {channels.map(({ key, label, value, href, Icon, hover }) => (
        <li key={key}>
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="glow-card flex items-center gap-4 p-4"
          >
            <span
              aria-hidden
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-raised/60 text-mute transition-colors ${hover}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="label-mono block">{label}</span>
              <span className="mt-1 block truncate text-sm text-ink">
                {value.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
