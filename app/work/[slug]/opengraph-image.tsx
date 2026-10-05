import { ImageResponse } from "next/og";
import sharp from "sharp";
import { projectBySlug, publicUrl } from "@/lib/projects";
import { heroOf, CATEGORY_LABEL } from "@/lib/types";
import { profile } from "@/content/profile";

export const alt = "Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Per-project share image: hero photo with title + tagline. Published projects only. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = await projectBySlug((await params).slug);
  const hero = p ? heroOf(p) : undefined;
  // The renderer (Satori) reads JPEG/PNG only, not the webp we serve, and stored content types vary;
  // so fetch the hero, re-encode it to a 1200x630 JPEG and inline it. Falls back to text-only.
  let img: string | null = null;
  if (hero) {
    try {
      const res = await fetch(publicUrl(hero.path));
      const jpg = await sharp(Buffer.from(await res.arrayBuffer())).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer();
      img = `data:image/jpeg;base64,${jpg.toString("base64")}`;
    } catch (e) {
      console.error("og image: hero unavailable", e);
    }
  }
  const title = p?.title ?? profile.name;
  const sub = p ? (p.tagline ?? CATEGORY_LABEL[p.category]) : profile.headline;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#171717", color: "white", fontFamily: "sans-serif" }}>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover", opacity: 0.85 }} />
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "48px 64px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 28, marginTop: 12, color: "#d4d4d4" }}>{sub}</div>
          <div style={{ fontSize: 22, marginTop: 20, color: "#fdba74" }}>{`${profile.name} · elilewisportfolio.info`}</div>
        </div>
      </div>
    ),
    size,
  );
}
