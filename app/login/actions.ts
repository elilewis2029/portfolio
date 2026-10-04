"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/supabase";

const safe = (next: string) => (next.startsWith("/") && !next.startsWith("//") ? next : "/");

export async function sendLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safe(String(formData.get("next") ?? "/"));
  // Only the owner gets a link; everyone else sees the same "check your email" screen.
  if (email && email === process.env.OWNER_EMAIL?.toLowerCase()) {
    const h = await headers();
    const origin = h.get("origin") ?? `https://${h.get("host")}`;
    const { error } = await (await authClient()).auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: true },
    });
    if (error) console.error("magic link:", error.message);
  }
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
}

/** Code entry, for when the email shows a code (custom SMTP) or the link opens in another browser. */
export async function verifyCode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").replace(/\s/g, "");
  const next = safe(String(formData.get("next") ?? "/"));
  if (email !== process.env.OWNER_EMAIL?.toLowerCase()) redirect("/login?error=1");
  const { error } = await (await authClient()).auth.verifyOtp({ email, token, type: "email" });
  if (error) redirect(`/login?sent=1&error=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signOut() {
  await (await authClient()).auth.signOut();
  redirect("/");
}
