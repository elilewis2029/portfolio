"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/projects", label: "Projects", match: ["/projects", "/archive"] },
  { href: "/experience", label: "Experience", match: ["/experience"] },
  { href: "/about", label: "About", match: ["/about"] },
];

/** Header tabs. The tab for the current section is marked (aria-current + underline) so you can see where you are. */
export default function NavTabs() {
  const pathname = usePathname();
  const cls = (on: boolean) =>
    `inline-flex min-h-11 items-center border-b-2 px-0.5 hover:text-ink ${on ? "border-ink text-ink" : "border-transparent"}`;
  return (
    <nav className="label flex gap-3 tracking-[0.02em] text-neutral-600 sm:gap-6 sm:tracking-[0.08em]" aria-label="Main">
      {TABS.map((t) => {
        const on = t.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
        return (
          <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className={cls(on)}>{t.label}</Link>
        );
      })}
      <a href="/resume" className={cls(false)}>Résumé</a>
    </nav>
  );
}
