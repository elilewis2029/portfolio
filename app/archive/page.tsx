import ProjectGrid from "@/components/ProjectGrid";
import { listProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";

export const metadata = { title: "Archive" };

export default async function Archive({ searchParams }: { searchParams: Promise<{ skill?: string; cat?: string }> }) {
  const { skill, cat } = await searchParams;
  const owner = await isOwner();
  const projects = await listProjects("archive", owner);
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Archive</h1>
      <p className="mb-6 mt-2 text-neutral-600 dark:text-neutral-400">
        High-school, craft and scrap builds, kept here for history.
      </p>
      <ProjectGrid projects={projects} base="/archive" skill={skill} cat={cat} />
    </>
  );
}
