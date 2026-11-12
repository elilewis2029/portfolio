import Link from "next/link";
import Image from "next/image";
import FeaturedList from "@/components/FeaturedList";
import { Field } from "@/components/Todo";
import { contactEmail, featuredProjects, listProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { CATEGORIES, CATEGORY_LABEL, categoryColor } from "@/lib/types";
import { profile } from "@/content/profile";
import { filled, filledList } from "@/lib/profile";

const AUDIENCES = ["pd", "mech", "mfg"];

export default async function Home({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const { for: aud } = await searchParams;
  const [owner, list, all] = await Promise.all([isOwner(), featuredProjects(), listProjects("current", false)]);
  let featured = list;
  // ?for=pd|mech|mfg puts the projects tagged for that audience first (for tailored application links).
  if (aud && AUDIENCES.includes(aud)) {
    featured = [...featured].sort((a, b) => Number(b.audience.includes(aud)) - Number(a.audience.includes(aud)));
  }
  const email = filled(profile.links.email) ?? contactEmail();
  const latestJob = profile.experience.find((e) => filled(e.org));
  const bio = filledList(profile.bio);
  // Range: how the published work splits across the four disciplines.
  const range = CATEGORIES.map((c) => ({ c, n: all.filter((p) => p.category === c).length })).filter((r) => r.n > 0);
  const total = range.reduce((s, r) => s + r.n, 0);

  return (
    <>
      {/* Hero: name, headline, a spec-sheet column, the range bar, CTAs */}
      <section className="grid gap-10 border-b border-rule pb-12 pt-6 lg:grid-cols-12 lg:gap-12 lg:pt-12">
        <div className="rise lg:col-span-7">
          <p className="label text-neutral-500">Portfolio · {new Date().getFullYear()}</p>
          <h1 className="mt-4 text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{profile.name}</h1>
          <p className="mt-6 max-w-xl text-xl leading-snug tracking-[-0.01em] sm:text-2xl">{profile.headline}</p>
          {(owner || filled(profile.tagline)) && <p className="mt-3 max-w-xl text-neutral-600"><Field value={profile.tagline} owner={owner} /></p>}
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/projects" className="btn btn-primary">All projects <span aria-hidden="true">→</span></Link>
            <a href="/resume" className="btn">Résumé</a>
            <Link href="/about" className="btn">About</Link>
            {email && <a href={`mailto:${email}`} className="btn">Email</a>}
          </div>
        </div>

        <div className="rise rise-2 lg:col-span-5">
          {profile.headshot && (
            <div className="relative mb-6 aspect-[4/5] w-40 overflow-hidden bg-wash">
              <Image src={profile.headshot} alt={profile.name} fill sizes="160px" className="object-cover grayscale" priority />
            </div>
          )}
          <dl className="border-t border-ink text-sm">
            <Spec label="Studying">{profile.education.degree}, {profile.education.school.replace(/ University$/, "")} · {profile.education.expected}</Spec>
            {latestJob && <Spec label="Now">{latestJob.title}, {latestJob.org}</Spec>}
            {filled(profile.subheadline) && <Spec label="Also">{filled(profile.subheadline)!.split(" · ").slice(1).join(" · ")}</Spec>}
            {(owner || filled(profile.seeking)) && <Spec label="Seeking"><Field value={profile.seeking} owner={owner} /></Spec>}
          </dl>
          {total > 0 && (
            <div className="mt-6">
              <p className="label text-neutral-500">Range · {total} projects</p>
              <div className="mt-2 flex h-2 w-full gap-px" role="img" aria-label={range.map((r) => `${CATEGORY_LABEL[r.c]}: ${r.n}`).join(", ")}>
                {range.map((r) => <span key={r.c} style={{ flexGrow: r.n, background: categoryColor(r.c) }} />)}
              </div>
              <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {range.map((r) => (
                  <li key={r.c}>
                    <Link href={`/projects?cat=${r.c}`} className="label flex items-center gap-2 text-neutral-700 hover:text-ink hover:underline">
                      <span className="swatch" style={{ background: categoryColor(r.c) }} aria-hidden="true" />
                      {CATEGORY_LABEL[r.c]} <span className="text-neutral-400">{r.n}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Selected work: a full-bleed dark band, every project the same size */}
      <section aria-labelledby="selected" className="relative left-1/2 -ml-[50vw] mt-12 w-screen bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label text-neutral-500">{String(featured.length).padStart(2, "0")} projects</p>
              <h2 id="selected" className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Selected work</h2>
            </div>
            <Link href="/projects" className="label inline-flex min-h-11 items-center gap-2 text-neutral-300 hover:text-white hover:underline">
              Full index <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-8">
            {featured.length === 0 ? (
              <p className="text-neutral-400">
                Projects coming soon.
                {owner && <span className="block text-sm">Owner: publish a project with a process photo, then tap Feature on it.</span>}
              </p>
            ) : (
              <FeaturedList projects={featured} />
            )}
          </div>
          {owner && featured.length < 3 && (
            <p className="mt-4 text-sm"><mark className="todo">[TODO: feature at least 3 projects — recruiters read a single card as a hobby site]</mark></p>
          )}
        </div>
      </section>

      {/* About in brief */}
      <section className="grid gap-8 py-14 lg:grid-cols-12">
        <h2 className="label text-neutral-500 lg:col-span-3">About</h2>
        <div className="lg:col-span-7">
          <p className="text-lg leading-relaxed">
            {filled(profile.blurb) ?? bio[0] ?? <Field value={profile.bio[0]} owner={owner} fallback={profile.headline} />}
          </p>
          <p className="mt-5"><Link href="/about" className="label inline-flex min-h-11 items-center gap-2 hover:underline">More about me <span aria-hidden="true">→</span></Link></p>
        </div>
      </section>
    </>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3 border-b border-rule py-2.5">
      <dt className="label pt-0.5 text-neutral-500">{label}</dt>
      <dd className="leading-snug">{children}</dd>
    </div>
  );
}
