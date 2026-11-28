import { STRENGTH_LABEL, strengthColor, strengthsOf } from "@/lib/types";

/** Mono line with a colour square per strength: "2026 · ■ SYSTEM DESIGN  ■ PRODUCT DESIGN" (year first, so a wrap falls between strengths). */
export default function StrengthTag({
  p, extra, className = "", tone = "text-neutral-600",
}: { p: { strengths?: string[] | null }; extra?: (string | number | null | undefined)[]; className?: string; tone?: string }) {
  const list = strengthsOf(p);
  const rest = (extra ?? []).filter((x) => x !== null && x !== undefined && x !== "");
  return (
    <p className={`label flex flex-wrap items-center gap-x-3 gap-y-1 ${tone} ${className}`}>
      {rest.length > 0 && <span>{rest.join(" · ")}{list.length ? " ·" : ""}</span>}
      {/* Flex gaps space the items on screen, but copied text and reader views ignore them ("2026 ·System designProduct
          design"). A real space before each strength, and a comma between two, keeps them apart there; flex drops the
          whitespace-only text, and the comma is screen-reader-and-copy only. */}
      {list.map((s, i) => (
        <span key={s} className="inline-flex items-center gap-2">
          {i > 0 && <span className="sr-only">,</span>}{" "}
          <span className="swatch" style={{ background: strengthColor(s) }} aria-hidden="true" />
          {STRENGTH_LABEL[s]}
        </span>
      ))}
    </p>
  );
}
