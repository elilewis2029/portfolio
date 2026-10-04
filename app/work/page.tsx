import ProjectGrid from "@/components/ProjectGrid";
import { listProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";

export const metadata = { title: "Work" };

export default async function Work({ searchParams }: { searchParams: Promise<{ skill?: string; cat?: string }> }) {
  const { skill, cat } = await searchParams;
  const owner = await isOwner();
  const projects = await listProjects("current", owner);
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Work</h1>
      <ProjectGrid projects={projects} base="/work" skill={skill} cat={cat} />
    </>
  );
}
