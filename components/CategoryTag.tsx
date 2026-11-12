import { CATEGORY_LABEL, categoryColor, type Category } from "@/lib/types";

/** Mono label with the discipline's colour square: "■ ENGINEERING · 2026". */
export default function CategoryTag({ category, extra, className = "" }: { category: string | null; extra?: (string | number | null | undefined)[]; className?: string }) {
  const label = category ? CATEGORY_LABEL[category as Category] ?? category : null;
  const rest = (extra ?? []).filter((x) => x !== null && x !== undefined && x !== "");
  return (
    <p className={`label flex items-center gap-2 text-neutral-600 ${className}`}>
      {label && <span className="swatch" style={{ background: categoryColor(category) }} aria-hidden="true" />}
      <span>{[label, ...rest].filter(Boolean).join(" · ")}</span>
    </p>
  );
}
