import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { featuredProjects } from "@/lib/projects";

export const revalidate = 60;

const AUDIENCES = ["pd", "mech", "mfg"];

export default async function Home({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: aud } = await searchParams;
  let featured = await featuredProjects();
  // ?for=pd|mech|mfg puts the projects tagged for that audience first (for tailored application links).
  if (aud && AUDIENCES.includes(aud)) {
    featured = [...featured].sort((a, b) => Number(b.audience.includes(aud)) - Number(a.audience.includes(aud)));
  }
  return (
    <>
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Eli Lewis</h1>
        <p className="mt-3 text-lg text-neutral-700 dark:text-neutral-300">
          Engineering student, Northwestern &rsquo;29 · Machinist at Ely Tool building custom tooling.
        </p>
      </section>

      {featured.length === 0 ? (
        <p className="text-neutral-500">Projects coming soon.</p>
      ) : (
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <ProjectCard key={p.id} p={p} priority={i < 3} />)}
        </section>
      )}

      <p className="mt-12">
        <Link href="/work" className="text-accent hover:underline">All work →</Link>
      </p>
    </>
  );
}
