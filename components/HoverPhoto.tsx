import Image from "next/image";
import type { Media } from "@/lib/types";

/**
 * The project's hover photo, stacked over the cover and faded in when the card is hovered or focused
 * (the parent link carries `group`). Used to show a render first and the real build on hover.
 */
export default function HoverPhoto({ m, sizes }: { m: Media; sizes: string }) {
  return (
    <>
      <Image src={m.path} alt={m.caption || ""} fill sizes={sizes} className="hover-swap object-cover" />
      <span className="hover-swap label absolute right-0 top-0 z-10 bg-ink px-2 py-1 text-white">As built</span>
    </>
  );
}
