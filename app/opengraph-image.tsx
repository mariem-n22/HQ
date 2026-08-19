import { ImageResponse } from "next/og";
import { ONE_LINER, PERSON } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${PERSON.name} — engineer, founder, racing driver`;

/** Site-wide social card, in the Pit Wall palette. */
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
          background: "#07070d",
          padding: "80px",
          color: "#e8e9f0",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "#7c6cf0" }}>
          MAHMOUD HQ
        </div>
        <div style={{ display: "flex", fontSize: 82, marginTop: 26, lineHeight: 1.05 }}>
          {PERSON.name}
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 20, color: "#38d6d6" }}>
          Engineer · Founder · Racing driver
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            marginTop: 28,
            color: "#9aa0b4",
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
