import type { CSSProperties, ReactNode } from "react";
import { ARCHIVE_DARK } from "@/lib/theme";

/**
 * A soft, feathered plate for type set over hero photography.
 *
 * The photograph itself is never touched. Every earlier attempt worked on the
 * image — a banded scrim, an eased vignette, a text halo — and each one either
 * veiled it or showed up as its own shape. This gives each piece of type a
 * little ground of its own and leaves the picture alone.
 *
 * WHY IT IS BUILT AS TWO LAYERS
 *
 * The obvious implementation — background and backdrop-filter directly on the
 * text span — produced two faults, both visible in the previous version. It
 * drew a hard rectangular edge, and on a heading that wrapped it drew one plate
 * per line: `box-decoration-break: clone` gives each line fragment its own
 * backdrop-filter, so where the fragments met, two translucent tints stacked
 * and left a seam of a different shade running between the lines.
 *
 * So the tint is its own absolutely-positioned layer sitting behind the text,
 * sized to the whole wrapper rather than to line fragments. One layer, one
 * blur, no seam however many lines the text runs to. It is then masked with a
 * radial gradient so it fades out instead of ending — there is no edge to see
 * because there is no edge.
 *
 * The layer's inset is negative and stated in `em`, so the plate tracks the
 * type it sits behind: the same component gives a hairline of ground around an
 * 11px credit line and a proportionate amount around a 60px title, without a
 * second scale to maintain. The text span itself carries no padding, so the
 * tint sits snug and the visible softness is all mask, not spacing.
 *
 * THE FOREGROUND IS DELIBERATELY THEME-INDEPENDENT
 *
 * `var(--color-ink)` cannot be used here. It is ivory in dark mode but
 * near-black in light mode, and near-black type on a faint dark tint over a
 * night photograph is unreadable — that is a real bug, not a theoretical one.
 * What this has to contrast against is an unpredictable photograph, not the
 * page chrome, so the plate is dark in both themes and the type on it has to be
 * light in both themes, for the same reason a subtitle is always light on a
 * dark plate.
 *
 * It is still the ink token rather than a raw white: `ARCHIVE_DARK.ink` is the
 * dark theme's ivory, read from lib/theme.ts, which is the token system's own
 * constants mirror. Nothing new is introduced and #FFF appears nowhere.
 *
 * There is no brass variant. The eyebrow used to be `text-amber`, and on a
 * translucent plate over lit sandstone it measured 1.92:1 — the light coming
 * through lands almost exactly on brass. Brass needs a near-opaque plate to
 * survive, which is not this. The eyebrow takes the same ink and carries its
 * accent through the mono/uppercase treatment.
 */

/** The dark theme's ivory, via the token system's constants mirror. */
export const GLASS_INK = ARCHIVE_DARK.ink;

/**
 * Opaque through the middle, gone by the edge. This is what removes the box:
 * the tint never reaches the layer's boundary at full strength, so it dissolves
 * into the photograph rather than stopping against it.
 */
const FEATHER =
  "radial-gradient(105% 135% at 50% 50%, #000 34%, rgba(0,0,0,0.55) 66%, transparent 100%)";

const PLATE: CSSProperties = {
  position: "absolute",
  // Negative, and in em: enough ground to clear ascenders and descenders and
  // nothing beyond it. The feather needs somewhere to happen, and this is it.
  inset: "-0.3em -0.55em",
  borderRadius: "0.6em",
  // A tint, not a panel — the photograph reads clearly through it. 0.48 is not
  // a taste value: it is the lightest setting at which the 11px eyebrow still
  // clears 4.5:1 where it crosses the lit sandstone of the current hero, which
  // is the brightest thing any label sits on. 0.44 measures 4.21 and fails.
  // Lower is available the moment that label stops landing on a bright patch —
  // it is the photograph setting this floor, not the design.
  backgroundColor: "rgba(11, 11, 10, 0.48)",
  // Just enough to take the edge off busy detail. At larger radii the image
  // behind the text turns to soup, which is the thing being avoided.
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  maskImage: FEATHER,
  WebkitMaskImage: FEATHER,
  pointerEvents: "none",
};

export function HeroLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`} style={{ color: GLASS_INK }}>
      <span aria-hidden style={PLATE} />
      <span className="relative">{children}</span>
    </span>
  );
}
