import { ImageResponse } from "next/og";
import { ONE_LINER, PERSON } from "@/lib/seo";
import { ARCHIVE_DARK } from "@/lib/theme";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${PERSON.name} — engineer, founder, racing driver`;

/**
 * Site-wide social card, in the Architectural Archive palette.
 *
 * Satori (which renders this) has no CSS-variable resolution, so the values
 * come from lib/theme.ts as literals rather than from globals.css. Always
 * dark: the card is composited into other people's feeds, where the site's
 * light mode has no meaning.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: ARCHIVE_DARK.base,
          padding: "80px",
          color: ARCHIVE_DARK.ink,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: ARCHIVE_DARK.brass }}>
          MAHMOUD HQ
        </div>
        <div style={{ display: "flex", fontSize: 82, marginTop: 26, lineHeight: 1.05 }}>
          {PERSON.name}
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 20, color: ARCHIVE_DARK.mute }}>
          Engineer · Founder · Racing driver
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            marginTop: 28,
            color: ARCHIVE_DARK.mute,
            maxWidth: 940,
            lineHeight: 1.45,
          }}
        >
          {ONE_LINER}
        </div>
      </div>
    ),
    size,
  );
}
