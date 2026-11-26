import Link from "next/link";
import FeaturedList from "@/components/FeaturedList";
import { contactEmail, featuredProjects, listProjects } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { STRENGTHS, STRENGTH_LABEL, strengthColor, strengthsOf } from "@/lib/types";
import { profile } from "@/content/profile";
import { filled } from "@/lib/profile";

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
  // Strengths: how often each one shows up across the published work. A project can count under two, so the
  // bar shows the mix of strengths, and the label counts projects, not tags.
  const range = STRENGTHS.map((c) => ({ c, n: all.filter((p) => strengthsOf(p).includes(c)).length })).filter((r) => r.n > 0);
  const total = all.filter((p) => strengthsOf(p).length > 0).length;

  return (
    <>
      {/* Hero, kept short so the featured work is on the first screen: name, headline and the "What I do" legend.
          Everything else (headshot, studies, roles, seeking, bio) lives on /about; the buttons sit under the featured work. */}
      <section className="grid gap-8 border-b border-rule pb-10 pt-6 lg:grid-cols-12 lg:items-end lg:gap-12 lg:pt-12">
        <div className="rise lg:col-span-7">
          <p className="label text-neutral-500">Portfolio · {new Date().getFullYear()}</p>
          <h1 className="mt-4 text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.045em]">{profile.name}</h1>
          <p className="mt-6 max-w-xl text-xl leading-snug tracking-[-0.01em] sm:text-2xl">{profile.headline}</p>
        </div>

        {total > 0 && (
          <div className="rise rise-2 lg:col-span-5">
            <p className="label text-neutral-500">What I do</p>
            <div className="mt-2 flex h-2 w-full gap-px" role="img" aria-label={range.map((r) => `${STRENGTH_LABEL[r.c]}: ${r.n} projects`).join(", ")}>
              {range.map((r) => <span key={r.c} style={{ flexGrow: r.n, background: strengthColor(r.c) }} />)}
            </div>
            <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {range.map((r) => (
                <li key={r.c}>
                  <Link href={`/projects?strength=${r.c}`} className="label flex items-center gap-2 text-neutral-700 hover:text-ink hover:underline">
                    <span className="swatch" style={{ background: strengthColor(r.c) }} aria-hidden="true" />
                    {STRENGTH_LABEL[r.c]} <span className="text-neutral-400">{r.n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Selected work: a full-bleed dark band, every project the same size */}
      <section aria-labelledby="selected" className="relative left-1/2 -ml-[50vw] mt-12 w-screen bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="label text-neutral-500">{String(featured.length).padStart(2, "0")} projects</p>
          <h2 id="selected" className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Selected work</h2>
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
          {/* Where to go next, after the work rather than before it. Outlined in white to read on the dark band. */}
          <nav aria-label="More" className="mt-10 flex flex-wrap gap-2 border-t border-neutral-800 pt-8">
            <Link href="/projects" className="btn border-white bg-white text-ink hover:bg-neutral-200 hover:text-ink">All projects <span aria-hidden="true">→</span></Link>
            <a href="/resume" className="btn border-neutral-500 text-white hover:border-white hover:bg-white hover:text-ink">Résumé</a>
            <Link href="/about" className="btn border-neutral-500 text-white hover:border-white hover:bg-white hover:text-ink">About</Link>
            {email && <a href={`mailto:${email}`} className="btn border-neutral-500 text-white hover:border-white hover:bg-white hover:text-ink">Email</a>}
          </nav>
        </div>
      </section>

    </>
  );
}

