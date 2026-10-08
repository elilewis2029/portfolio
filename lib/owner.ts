import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ownerEmail } from "./supabase";

/** The page an action was sent from (same site only), so sign-in can return there. */
async function fromPage() {
  const h = await headers();
  try {
    const ref = new URL(h.get("referer") ?? "");
    return ref.host === h.get("host") ? ref.pathname + ref.search : null;
  } catch {
    return null;
  }
}

/** Guard for owner-only pages and actions. Without `next`, sign-in returns to the page the action came from. */
export async function requireOwner(next?: string) {
  const email = await ownerEmail();
  if (!email) redirect(`/login?next=${encodeURIComponent(next ?? (await fromPage()) ?? "/")}`);
  return email;
}

/** Is the owner signed in? Drives owner mode (controls visitors never see). */
export async function isOwner() {
  return !!(await ownerEmail());
}
