import { STRENGTH_LABEL, strengthColor, strengthsOf } from "@/lib/types";

/** Mono line with a colour square per strength: "2026 · ■ SYSTEM DESIGN  ■ USER & PRODUCT DESIGN" (year first, so a wrap falls between strengths). */
export default function StrengthTag({
  p, extra, className = "", tone = "text-neutral-600",
}: { p: { strengths?: string[] | null }; extra?: (string | number | null | undefined)[]; className?: string; tone?: string }) {
  const list = strengthsOf(p);
  const rest = (extra ?? []).filter((x) => x !== null && x !== undefined && x !== "");
  return (
    <p className={`label flex flex-wrap items-center gap-x-3 gap-y-1 ${tone} ${className}`}>
      {rest.length > 0 && <span>{rest.join(" · ")}{list.length ? " ·" : ""}</span>}
      {list.map((s) => (
        <span key={s} className="inline-flex items-center gap-2">
          <span className="swatch" style={{ background: strengthColor(s) }} aria-hidden="true" />
          {STRENGTH_LABEL[s]}
        </span>
      ))}
    </p>
  );
}
