import Link from "next/link";
import ExperienceList, { visibleExperience } from "@/components/ExperienceList";
import { isOwner } from "@/lib/owner";

export const metadata = { title: "Experience", description: "Jobs and shop roles: what I ran, taught and built." };

export default async function Experience() {
  const owner = await isOwner();
  const any = visibleExperience(owner).length > 0;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Experience</h1>
      <div className="mb-8 mt-3 flex flex-wrap items-center gap-4 text-sm">
        <a href="/resume" className="btn">Résumé (PDF)</a>
        <Link href="/projects" className="text-accent hover:underline">See the projects →</Link>
      </div>
      {any ? <ExperienceList owner={owner} /> : <p className="text-neutral-500">Coming soon.</p>}
    </div>
  );
}
