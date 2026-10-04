import "server-only";
import { redirect } from "next/navigation";
import { ownerEmail } from "./supabase";

/** Guard for owner-only pages and actions. */
export async function requireOwner(next = "/review") {
  const email = await ownerEmail();
  if (!email) redirect(`/login?next=${encodeURIComponent(next)}`);
  return email;
}
