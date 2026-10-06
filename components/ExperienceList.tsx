import { Field } from "@/components/Todo";
import { profile } from "@/content/profile";
import { filled, filledList } from "@/lib/profile";

/** Jobs from content/profile.ts. Owner sees TODO placeholders highlighted; visitors only see filled values. */
export function visibleExperience(owner: boolean) {
  return profile.experience.filter((e) => (owner ? !!e.org.trim() : !!filled(e.org)));
}

export default function ExperienceList({ owner }: { owner: boolean }) {
  const show = (v: string | null | undefined) => owner ? !!v?.trim() : !!filled(v);
  const bullets = (l: string[]) => owner ? l.filter((s) => s.trim()) : filledList(l);
  return (
    <ul className="space-y-6">
      {visibleExperience(owner).map((e, i) => (
        <li key={i} className="grid gap-1 sm:grid-cols-[9rem_1fr]">
          <div className="text-sm text-neutral-500"><Field value={e.dates} owner={owner} fallback="" /></div>
          <div>
            <p className="font-semibold"><Field value={e.title} owner={owner} /> · <Field value={e.org} owner={owner} />
              {show(e.location) && <span className="font-normal text-neutral-500"> · <Field value={e.location} owner={owner} /></span>}
            </p>
            {bullets(e.bullets).length > 0 && (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {bullets(e.bullets).map((s, j) => <li key={j}><Field value={s} owner={owner} /></li>)}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
