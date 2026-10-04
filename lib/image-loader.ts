"use client";

type Args = { src: string; width: number; quality?: number };

/** next/image loader: bucket paths go through Supabase image transforms; absolute URLs pass through. */
export default function supabaseLoader({ src, width, quality }: Args) {
  if (/^https?:\/\//.test(src) || src.startsWith("/")) return src;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/render/image/public/portfolio/${src}?width=${width}&quality=${quality ?? 75}&resize=contain`;
}
