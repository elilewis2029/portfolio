"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/work", label: "Work", match: ["/work", "/archive"] },
  { href: "/experience", label: "Experience", match: ["/experience"] },
  { href: "/about", label: "About", match: ["/about"] },
];

/** Header tabs. The tab for the current section is marked (aria-current + underline) so you can see where you are. */
export default function NavTabs() {
  const pathname = usePathname();
  const cls = (on: boolean) =>
    `inline-flex min-h-11 items-center border-b-2 px-0.5 hover:text-accent ${on ? "border-accent font-medium text-neutral-900 dark:text-neutral-100" : "border-transparent"}`;
  return (
    <nav className="flex gap-3 text-sm text-neutral-600 sm:gap-4 dark:text-neutral-300" aria-label="Main">
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
