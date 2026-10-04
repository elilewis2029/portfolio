import { NextResponse } from "next/server";
import { publicDb } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Daily Vercel cron (vercel.json): one cheap query so a free-tier Supabase project is never paused for inactivity. */
export async function GET() {
  const { count, error } = await publicDb().from("projects").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: !error, published: count ?? 0, at: new Date().toISOString() }, { status: error ? 500 : 200 });
}
