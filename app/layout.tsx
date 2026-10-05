import type { Metadata, Viewport } from "next";
import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import SocialLinks from "@/components/SocialLinks";
import AddSheet from "@/components/owner/AddSheet";
import { contactEmail } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { signOut } from "@/app/login/actions";
import { profile } from "@/content/profile";
import { filled } from "@/lib/profile";
import "./globals.css";

export const SITE_URL = "https://elilewisportfolio.info";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${profile.name} — Engineering portfolio`, template: `%s · ${profile.name}` },
  description: [profile.headline, filled(profile.tagline)].filter(Boolean).join(". "),
  openGraph: { type: "website", siteName: `${profile.name} — Engineering portfolio`, locale: "en_US" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: profile.name, statusBarStyle: "default" },
  icons: { apple: "/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#c2410c", viewportFit: "cover" };
// The "+" intake action (image processing + Claude call, ~25 s) runs under whichever page opened the sheet.
export const maxDuration = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const email = filled(profile.links.email) ?? contactEmail();
  const owner = await isOwner();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-1 focus:text-white">
          Skip to content
        </a>
        <header className="site no-print sticky top-0 z-30 border-b border-neutral-200/80 bg-white/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
          <div className="mx-auto flex max-w-5xl items-center gap-x-5 px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">{profile.name}</Link>
            <nav className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-300" aria-label="Main">
              <Link href="/work" className="hover:text-accent">Work</Link>
              <Link href="/about" className="hover:text-accent">About</Link>
              <a href="/resume" className="hover:text-accent">Résumé</a>
            </nav>
            <div className="ml-auto flex items-center gap-4">
              <SocialLinks className="hidden sm:flex" />
              <div className="hidden sm:block"><CopyEmail email={email} /></div>
              {owner && <Link href="/review" className="chip border-accent text-accent">Owner</Link>}
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

        <footer className="site no-print border-t border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-6">
            <span>© {new Date().getFullYear()} {profile.name}</span>
            {email && <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>}
            <SocialLinks />
            <Link href="/about" className="hover:text-accent">About</Link>
            <Link href="/archive" className="hover:text-accent">Archive</Link>
            <span className="ml-auto flex items-center gap-4">
              {owner ? (
                <>
                  <Link href="/review" className="hover:text-accent">Review</Link>
                  <form action={signOut}><button className="hover:text-accent">Sign out</button></form>
                </>
              ) : (
                <Link href="/login" className="text-xs text-neutral-400 hover:text-accent">Sign in</Link>
              )}
            </span>
          </div>
        </footer>

        {owner && <AddSheet supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!} />}
      </body>
    </html>
  );
}
