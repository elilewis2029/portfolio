"use client";

type Args = { src: string; width: number; quality?: number };

/**
 * next/image loader for bucket paths. Absolute URLs and /public files pass through.
 * Supabase image transforms (resize on the fly) are a paid-plan feature; on the free plan the
 * endpoint returns 403, so by default we serve the stored 1600px webp as-is.
 * Set NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS=1 after upgrading to get per-width resizing.
 */
export default function supabaseLoader({ src, width, quality }: Args) {
  if (/^https?:\/\//.test(src) || src.startsWith("/")) return src;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS === "1") {
    return `${base}/storage/v1/render/image/public/portfolio/${src}?width=${width}&quality=${quality ?? 75}&resize=contain`;
  }
  return `${base}/storage/v1/object/public/portfolio/${src}`;
}
