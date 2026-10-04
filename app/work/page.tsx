import ProjectGrid from "@/components/ProjectGrid";
import { listProjects } from "@/lib/projects";

export const revalidate = 60;
export const metadata = { title: "Work" };

export default async function Work({ searchParams }: { searchParams: Promise<{ skill?: string; cat?: string }> }) {
  const { skill, cat } = await searchParams;
  const projects = await listProjects("current");
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Work</h1>
      <ProjectGrid projects={projects} base="/work" skill={skill} cat={cat} />
    </>
  );
}
