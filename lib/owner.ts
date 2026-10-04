import "server-only";
import { redirect } from "next/navigation";
import { ownerEmail } from "./supabase";

/** Guard for owner-only pages and actions. */
export async function requireOwner(next = "/") {
  const email = await ownerEmail();
  if (!email) redirect(`/login?next=${encodeURIComponent(next)}`);
  return email;
}

/** Is the owner signed in? Drives owner mode (controls visitors never see). */
export async function isOwner() {
  return !!(await ownerEmail());
}
