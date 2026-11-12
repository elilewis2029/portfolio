import ProjectGrid from "@/components/ProjectGrid";
import { listProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";

export const metadata = { title: "Projects" };

export default async function Projects({ searchParams }: { searchParams: Promise<{ skill?: string; cat?: string }> }) {
  const { skill, cat } = await searchParams;
  const owner = await isOwner();
  const projects = await listProjects("current", owner);
  return (
    <>
      <header className="mb-8 border-b border-ink pb-6 pt-4">
        <p className="label text-neutral-500">Index</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Projects</h1>
        <p className="mt-3 max-w-xl text-neutral-600">Everything I&apos;ve built, coded by discipline. The home page shows a selected few.</p>
      </header>
      <ProjectGrid projects={projects} base="/projects" skill={skill} cat={cat} />
    </>
  );
}
