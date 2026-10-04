import { NextResponse } from "next/server";
import { publicUrl } from "@/lib/projects";

// Upload the current résumé to the bucket as `resume.pdf`.
export function GET() {
  return NextResponse.redirect(publicUrl("resume.pdf"), 307);
}
