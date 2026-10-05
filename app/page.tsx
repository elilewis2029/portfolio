import Link from "next/link";
import Image from "next/image";
import ProjectCard from "@/components/ProjectCard";
import { Field } from "@/components/Todo";
import { contactEmail, featuredProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { profile } from "@/content/profile";
import { filled, filledList } from "@/lib/profile";

const AUDIENCES = ["pd", "mech", "mfg"];

export default async function Home({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: aud } = await searchParams;
  const [owner, list] = await Promise.all([isOwner(), featuredProjects()]);
  let featured = list;
  // ?for=pd|mech|mfg puts the projects tagged for that audience first (for tailored application links).
  if (aud && AUDIENCES.includes(aud)) {
    featured = [...featured].sort((a, b) => Number(b.audience.includes(aud)) - Number(a.audience.includes(aud)));
  }
  const email = filled(profile.links.email) ?? contactEmail();
  const latestJob = profile.experience.find((e) => filled(e.org));
  const bio = filledList(profile.bio);

  return (
    <>
      {/* Hero: name, headline, pitch, the ask, CTAs */}
      <section className="mb-12 grid gap-8 pt-4 sm:grid-cols-[1fr_auto] sm:items-center sm:pt-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{profile.name}</h1>
          <p className="mt-3 text-xl leading-snug text-neutral-800 dark:text-neutral-200">{profile.headline}</p>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">{profile.tagline}</p>
          <p className="mt-3 font-medium text-accent">
            <Field value={profile.seeking} owner={owner} />
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/work" className="btn btn-primary">See the work</Link>
            <Link href="/about" className="btn">About me</Link>
            <a href="/resume" className="btn">Résumé</a>
            {email && <a href={`mailto:${email}`} className="btn">Email</a>}
          </div>
        </div>
        {(profile.headshot || owner) && (
          <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-900/10 sm:h-48 sm:w-48 dark:bg-neutral-900 dark:ring-white/10">
            {profile.headshot ? (
              <Image src={profile.headshot} alt={profile.name} fill sizes="192px" className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-xs"><mark className="todo">[TODO: headshot]</mark></div>
            )}
          </div>
        )}
      </section>

      {/* Featured projects */}
      <section>
        <div className="mb-4 flex items-baseline gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {featured.length >= 3 ? "Featured work" : "Work"}
          </h2>
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
        {owner && featured.length < 3 && (
          <p className="mt-4 text-sm"><mark className="todo">[TODO: feature at least 3 projects — recruiters read a single card as a hobby site]</mark></p>
        )}
      </section>

      {/* About in brief */}
      <section className="mt-16 grid gap-8 border-t border-neutral-200 pt-10 sm:grid-cols-3 dark:border-neutral-800">
        <div className="sm:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">About</h2>
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">
            {bio[0] ?? <Field value={profile.bio[0]} owner={owner} fallback={`${profile.headline}. ${profile.tagline}`} />}
          </p>
          <p className="mt-3"><Link href="/about" className="text-accent hover:underline">More about me →</Link></p>
        </div>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Education</dt>
            <dd className="mt-1">{profile.education.degree}<br /><span className="text-neutral-600 dark:text-neutral-400">{profile.education.school}, {profile.education.expected.toLowerCase()}</span></dd>
          </div>
          {latestJob && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Experience</dt>
              <dd className="mt-1">{latestJob.title}, {latestJob.org}<br /><span className="text-neutral-600 dark:text-neutral-400"><Field value={latestJob.dates} owner={owner} /></span></dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Currently</dt>
            <dd className="mt-1"><Field value={profile.currently} owner={owner} fallback={<span className="text-neutral-500">—</span>} /></dd>
          </div>
        </dl>
      </section>
    </>
  );
}
