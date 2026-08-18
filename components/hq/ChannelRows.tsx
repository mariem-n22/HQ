"use client";

import { useState } from "react";
import { Check, Copy, MapPin } from "lucide-react";
import { isTodo, type SiteSettings } from "@/lib/data";
import { channelsOf } from "@/lib/channels";

/**
 * The contact page's channel list: one tappable row per channel, plus the
 * location row and the availability pill. Everything comes from the
 * SiteSettings singleton, so it is all dashboard-editable.
 */
export function ChannelRows({ settings }: { settings: SiteSettings | null }) {
  const [copied, setCopied] = useState(false);
  const channels = channelsOf(settings);

  const whatsapp = channels.find((c) => c.key === "whatsapp");
  const phone = channels.find((c) => c.key === "phone");
  const rest = channels.filter((c) => !["whatsapp", "phone"].includes(c.key));

  async function copyPhone() {
    if (!settings?.phone) return;
    try {
      await navigator.clipboard.writeText(settings.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const hasLocation = settings?.location && !isTodo(settings.location);
  const hasAvailability =
    settings?.openToOpportunities && settings.availability && !isTodo(settings.availability);

  if (channels.length === 0 && !hasLocation && !hasAvailability) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-6 text-center">
        <p className="text-sm text-mute">
          No channels published yet — add them under Settings in the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {whatsapp ? (
        <Row
          href={whatsapp.href}
          icon={<whatsapp.Icon className="h-4 w-4" />}
          eyebrow="Chat on WhatsApp"
          value={settings?.phone ?? whatsapp.value}
          accent="text-go"
        />
      ) : null}

      {/* Phone gets a copy affordance alongside the tel: link. */}
      {phone ? (
        <div className="glow-card flex items-center gap-4 p-4">
          <a href={phone.href} className="flex min-w-0 flex-1 items-center gap-4">
            <IconBox accent="text-cyan">
              <phone.Icon className="h-4 w-4" />
            </IconBox>
            <span className="min-w-0">
              <span className="label-mono block">Call or copy</span>
              <span className="mt-1 block truncate text-sm text-ink">{phone.value}</span>
            </span>
          </a>
          <button
            type="button"
            onClick={copyPhone}
            aria-label={copied ? "Number copied" : "Copy phone number"}
            className="shrink-0 rounded-md border border-line p-2 text-mute transition-colors hover:border-amber hover:text-amber"
          >
            {copied ? (
              <Check aria-hidden className="h-4 w-4 text-go" />
            ) : (
              <Copy aria-hidden className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : null}

      {rest.map((channel) => (
        <Row
          key={channel.key}
          href={channel.href}
          icon={<channel.Icon className="h-4 w-4" />}
          eyebrow={
            channel.key === "linkedin"
              ? "Connect on LinkedIn"
              : channel.key === "instagram"
                ? "Follow on Instagram"
                : channel.key === "github"
                  ? "Code on GitHub"
                  : channel.label
          }
          value={channel.value.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          accent="text-cyan"
        />
      ))}

      {hasLocation ? (
        <div className="glow-card flex items-center gap-4 p-4">
          <IconBox accent="text-amber">
            <MapPin className="h-4 w-4" />
          </IconBox>
          <span className="min-w-0">
            <span className="label-mono block">Based in</span>
            <span className="mt-1 block truncate text-sm text-ink">{settings.location}</span>
          </span>
        </div>
      ) : null}

      {hasAvailability ? (
        <p className="inline-flex items-center gap-2.5 rounded-md border border-go/40 bg-go/10 px-4 py-3 text-sm text-go">
          <span aria-hidden className="pulse-pip h-2 w-2 rounded-full bg-go" />
          {settings.availability}
        </p>
      ) : null}
    </div>
  );
}

function IconBox({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <span
      aria-hidden
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-raised/60 ${accent}`}
    >
      {children}
    </span>
  );
}

function Row({
  href,
  icon,
  eyebrow,
  value,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  value: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="glow-card flex items-center gap-4 p-4"
    >
      <IconBox accent={accent}>{icon}</IconBox>
      <span className="min-w-0 flex-1">
        <span className="label-mono block">{eyebrow}</span>
        <span className="mt-1 block truncate text-sm text-ink">{value}</span>
      </span>
      <span aria-hidden className="shrink-0 font-mono text-xs text-mute">
        →
      </span>
    </a>
  );
}
