import Image from "next/image";
import Link from "next/link";
import { Field } from "@/components/Todo";
import SocialLinks from "@/components/SocialLinks";
import CopyEmail from "@/components/CopyEmail";
import { contactEmail } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { profile } from "@/content/profile";
import { filled, filledList, isTodo } from "@/lib/profile";

export const metadata = { title: "About", description: "Who I am, what I’ve built, and what I’m looking for." };

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">{children}</h2>;
}

export default async function About() {
  const owner = await isOwner();
  const email = filled(profile.links.email) ?? contactEmail();
  const edu = profile.education;
  const show = (v: string | null | undefined) => owner ? !!v?.trim() : !!filled(v);
  const showList = (l: string[]) => owner ? l.some((s) => s.trim()) : filledList(l).length > 0;
  const experience = profile.experience.filter((e) => show(e.org));
  const involvement = profile.involvement.filter((e) => show(e.org));
  const skills = Object.entries(profile.skills).filter(([, l]) => showList(l));
  const List = ({ items }: { items: string[] }) => (
    <ul className="list-disc space-y-1 pl-5">
      {(owner ? items : filledList(items)).map((s, i) => <li key={i}><Field value={s} owner={owner} /></li>)}
    </ul>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <section className="mb-10 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {(profile.headshot || owner) && (
          <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/10 dark:bg-neutral-900 dark:ring-white/10">
            {profile.headshot ? (
              <Image src={profile.headshot} alt={profile.name} fill sizes="144px" className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center p-3 text-center text-xs"><mark className="todo">[TODO: headshot photo]</mark></div>
            )}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-lg text-neutral-700 dark:text-neutral-300">{profile.headline}</p>
          {show(profile.location) && <p className="mt-1 text-sm text-neutral-500"><Field value={profile.location} owner={owner} /></p>}
          <p className="mt-3 font-medium text-accent"><Field value={profile.seeking} owner={owner} /></p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {email && <CopyEmail email={email} className="text-accent hover:underline" />}
            <SocialLinks />
            <a href="/resume" className="btn">Résumé (PDF)</a>
            {owner && !filled(profile.links.linkedin) && <mark className="todo text-xs">[TODO: LinkedIn URL]</mark>}
          </div>
        </div>
      </section>

      {showList(profile.bio) && (
        <section className="mb-10 space-y-3 text-[17px] leading-relaxed">
          {(owner ? profile.bio : filledList(profile.bio)).map((p, i) => <p key={i}><Field value={p} owner={owner} /></p>)}
        </section>
      )}

      {show(profile.currently) && (
        <section className="mb-10 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <H2>Currently</H2>
          <p><Field value={profile.currently} owner={owner} /></p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-10">
          <H2>Experience</H2>
          <ul className="space-y-6">
            {experience.map((e, i) => (
              <li key={i} className="grid gap-1 sm:grid-cols-[9rem_1fr]">
                <div className="text-sm text-neutral-500"><Field value={e.dates} owner={owner} fallback="" /></div>
                <div>
                  <p className="font-semibold"><Field value={e.title} owner={owner} /> · <Field value={e.org} owner={owner} />
                    {show(e.location) && <span className="font-normal text-neutral-500"> · <Field value={e.location} owner={owner} /></span>}
                  </p>
                  {showList(e.bullets) && <div className="mt-1 text-sm"><List items={e.bullets} /></div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <H2>Education</H2>
        <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
          <div className="text-sm text-neutral-500">{edu.expected}</div>
          <div>
            <p className="font-semibold">{edu.degree} · {edu.school}{edu.location && <span className="font-normal text-neutral-500"> · {edu.location}</span>}</p>
            {show(edu.gpa) && <p className="mt-1 text-sm">GPA <Field value={edu.gpa} owner={owner} /></p>}
            {showList(edu.coursework) && (
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="text-neutral-500">Coursework: </span>
                {(owner ? edu.coursework : filledList(edu.coursework)).map((c, i, a) => <span key={i}><Field value={c} owner={owner} />{i < a.length - 1 ? ", " : ""}</span>)}
              </p>
            )}
            {showList(edu.honors) && <div className="mt-1 text-sm"><List items={edu.honors} /></div>}
          </div>
        </div>
      </section>

      {skills.length > 0 && (
        <section className="mb-10">
          <H2>Skills</H2>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {skills.map(([group, items]) => (
              <div key={group}>
                <dt className="text-sm font-semibold">{group}</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {(owner ? items : filledList(items)).map((s, i) => isTodo(s)
                    ? <mark key={i} className="todo text-xs">{s}</mark>
                    : <span key={i} className="chip">{s}</span>)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-neutral-500">See them in use: <Link href="/work" className="text-accent hover:underline">filter projects by skill →</Link></p>
        </section>
      )}

      {involvement.length > 0 && (
        <section className="mb-10">
          <H2>Teams &amp; involvement</H2>
          <ul className="space-y-3">
            {involvement.map((e, i) => (
              <li key={i} className="grid gap-1 sm:grid-cols-[9rem_1fr]">
                <div className="text-sm text-neutral-500"><Field value={e.dates} owner={owner} fallback="" /></div>
                <div><span className="font-semibold"><Field value={e.role} owner={owner} /></span> · <Field value={e.org} owner={owner} />
                  {show(e.note) && <p className="text-sm text-neutral-600 dark:text-neutral-400"><Field value={e.note} owner={owner} /></p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showList(profile.awards) && (
        <section className="mb-10">
          <H2>Awards &amp; certifications</H2>
          <List items={profile.awards} />
        </section>
      )}

      {showList(profile.interests) && (
        <section className="mb-10">
          <H2>Outside engineering</H2>
          <p className="text-neutral-700 dark:text-neutral-300">
            {(owner ? profile.interests : filledList(profile.interests)).map((c, i, a) => <span key={i}><Field value={c} owner={owner} />{i < a.length - 1 ? " · " : ""}</span>)}
          </p>
        </section>
      )}

      <section className="rounded-lg bg-accent-soft p-5 dark:bg-accent/10">
        <H2>Contact</H2>
        <p>The best way to reach me is email{email && <>: <a href={`mailto:${email}`} className="text-accent underline underline-offset-2">{email}</a></>}.</p>
        <div className="mt-2"><SocialLinks /></div>
      </section>
    </div>
  );
}
