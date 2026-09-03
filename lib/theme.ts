/**
 * Design tokens as plain constants.
 *
 * The CSS custom properties in app/globals.css are the source of truth for
 * anything rendered in a browser. This file exists for the one context that
 * cannot read them: `next/og`'s ImageResponse renders through Satori, which
 * has no CSS-variable resolution, so app/opengraph-image.tsx needs literal
 * values. Keeping them here rather than inline in the route means the OG card
 * still flows through the token system rather than drifting from it.
 *
 * If you change a value in globals.css, change it here too — these are the
 * same colors, written twice because two renderers need them in two forms.
 *
 * The OG card is always dark: it is composited into other people's timelines
 * and inboxes, where the site's light mode has no meaning.
 */

export const ARCHIVE_DARK = {
  /** Obsidian — the page ground. Never pure black. */
  base: "#0B0B0A",
  /** Charcoal — cards and panels. */
  surface: "#151514",
  /** Ivory — primary text. Never pure white. */
  ink: "#F1EFE9",
  /** Stone — secondary text. */
  mute: "#A7A39A",
  /** Architectural line — hairline rules and borders. */
  line: "#2B2A27",
  /** Muted brass — the single accent, used sparingly. */
  brass: "#9A8564",
} as const;

export const ARCHIVE_LIGHT = {
  /** Warm limestone — the page ground. Never pure white. */
  base: "#E9E6DE",
  surface: "#F3F1EB",
  /** Graphite — primary text. */
  ink: "#171715",
  mute: "#55534F",
  line: "#D2CEC4",
  /**
   * Brass, value-adjusted for the light ground. Identical hue (37°) and
   * saturation (35%) to the dark-mode brass — only the value drops, from
   * 0.60 to 0.46. At the dark-mode #9A8564 the accent measures 2.85:1 on
   * limestone, which fails contrast for the small text it carries (nav
   * active state, eyebrow labels, project metadata). This measures 4.52:1.
   */
  brass: "#62563F",
} as const;
