import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { featuredProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";

const AUDIENCES = ["pd", "mech", "mfg"];

export default async function Home({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: aud } = await searchParams;
  const [owner, list] = await Promise.all([isOwner(), featuredProjects()]);
  let featured = list;
  // ?for=pd|mech|mfg puts the projects tagged for that audience first (for tailored application links).
  if (aud && AUDIENCES.includes(aud)) {
    featured = [...featured].sort((a, b) => Number(b.audience.includes(aud)) - Number(a.audience.includes(aud)));
  }
  return (
    <>
      <section className="mb-12 max-w-2xl pt-4 sm:pt-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Eli Lewis</h1>
        <p className="mt-4 text-xl leading-snug text-neutral-800 dark:text-neutral-200">
          Mechanical engineering student, Northwestern &rsquo;29.
          <br className="hidden sm:block" /> I design and build things, from fixtures to electronics.
        </p>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Last summer I worked as a machinist at Ely Tool, a custom-tooling shop. Before that I restored, modded and
          built things in my own shop. Each project below shows the process, not just the result.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-baseline gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Featured work</h2>
          <Link href="/work" className="ml-auto text-sm text-accent hover:underline">All work →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-neutral-500">
            Projects coming soon.
            {owner && <span className="block text-sm">Owner: publish a project with a process photo, then tap Feature on it.</span>}
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => <ProjectCard key={p.id} p={p} priority={i < 3} />)}
          </div>
        )}
      </section>
    </>
  );
}
