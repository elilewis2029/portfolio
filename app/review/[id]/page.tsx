import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/owner";
import { projectByIdAdmin } from "@/lib/projects";

/** Alias kept from the old admin: editing now happens inline on the project page. */
export default async function EditAlias({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireOwner(`/review/${id}`);
  const p = await projectByIdAdmin(id);
  if (!p) notFound();
  redirect(`/work/${p.slug}?edit=1`);
}
