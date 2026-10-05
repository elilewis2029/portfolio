import { profile } from "@/content/profile";

/** A value still waiting on the owner. Shown highlighted to the owner, hidden from visitors. */
export const isTodo = (v: string | null | undefined) => !!v && /^\s*\[TODO/i.test(v);

/** A filled-in value, or null if empty / TODO. */
export const filled = (v: string | null | undefined) => (v && v.trim() && !isTodo(v) ? v.trim() : null);

/** Non-TODO, non-empty entries of a list. */
export const filledList = (list: string[] | undefined) => (list ?? []).filter((s) => filled(s));

/** Every TODO string in the profile, with a dotted path, for docs/INPUTS.md and the owner checklist. */
export function profileTodos(): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === "string") { if (isTodo(v)) out.push({ path, text: v }); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
    if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, path ? `${path}.${k}` : k));
  };
  walk(profile, "");
  if (!profile.headshot) out.unshift({ path: "headshot", text: "[TODO: headshot photo]" });
  return out;
}
