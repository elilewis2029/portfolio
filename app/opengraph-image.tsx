import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { filled } from "@/lib/profile";

export const runtime = "edge";
export const alt = `${profile.name} — Engineering portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default share image: name, headline, pitch. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, background: "#fafaf9", color: "#171717", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 24, height: "100%", background: "#c2410c" }} />
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>{profile.name}</div>
        <div style={{ fontSize: 40, marginTop: 12, color: "#404040" }}>{profile.headline}</div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#737373", maxWidth: 1000 }}>{filled(profile.tagline) ?? "Projects with process photos, not just results."}</div>
        <div style={{ fontSize: 24, marginTop: 36, color: "#c2410c" }}>elilewisportfolio.info</div>
      </div>
    ),
    size,
  );
}
