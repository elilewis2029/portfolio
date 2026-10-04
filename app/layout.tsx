import type { Metadata, Viewport } from "next";
import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import { contactEmail } from "@/lib/projects";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Eli Lewis — Engineering portfolio", template: "%s · Eli Lewis" },
  description: "Engineering student at Northwestern and machinist at Ely Tool building custom tooling.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Add project", statusBarStyle: "default" },
  icons: { apple: "/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#c2410c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const email = contactEmail();
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="site no-print border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="font-semibold">Eli Lewis</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/work" className="hover:text-accent">Work</Link>
              <a href="/resume" className="hover:text-accent">Résumé (PDF)</a>
            </nav>
            <div className="ml-auto"><CopyEmail email={email} /></div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="site no-print border-t border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-4 py-6">
            <span>© {new Date().getFullYear()} Eli Lewis</span>
            {email && <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>}
            <Link href="/archive" className="ml-auto hover:text-accent">Archive</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
