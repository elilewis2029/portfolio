import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Public reads, under RLS (published rows only). */
export function publicDb() {
  return createClient(url(), anon(), {
    db: { schema: "portfolio" },
    auth: { persistSession: false },
  });
}

/** Service-role client: server-only writes and owner reads (drafts). */
export function adminDb() {
  return createClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    db: { schema: "portfolio" },
    auth: { persistSession: false },
  });
}

/** Cookie-bound auth client, for the magic-link session. */
export async function authClient() {
  const store = await cookies();
  return createServerClient(url(), anon(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a server component; middleware refreshes the session instead
        }
      },
    },
  });
}

/** The signed-in owner's email, or null. Cached per request (layout + page + actions all ask). */
export const ownerEmail = cache(async (): Promise<string | null> => {
  const store = await cookies();
  // No Supabase auth cookie at all: skip the network round-trip visitors would otherwise pay.
  if (!store.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"))) return null;
  const { data } = await (await authClient()).auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return email && email === process.env.OWNER_EMAIL?.toLowerCase() ? email : null;
});
