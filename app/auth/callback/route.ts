import { NextResponse, type NextRequest } from "next/server";
import { authClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/review";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/review";
  if (code) {
    const { error } = await (await authClient()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
