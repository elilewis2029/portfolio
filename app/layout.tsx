import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CopyEmail from "@/components/CopyEmail";
import SocialLinks from "@/components/SocialLinks";
import NavTabs from "@/components/NavTabs";
import SignInLink from "@/components/SignInLink";
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
  // Footer links get a 44 px tall hit area (Apple HIG / Material) without changing how they look.
  const flink = "inline-flex min-h-11 items-center hover:text-accent";
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-1 focus:text-white on-accent">
          Skip to content
        </a>
        <header className="site no-print sticky top-0 z-30 border-b border-neutral-200/80 bg-white/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
          <div className="mx-auto flex max-w-5xl items-center gap-x-4 px-4 py-1 sm:gap-x-5">
            <Link href="/" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap font-semibold tracking-tight">{profile.name}</Link>
            <NavTabs />
            <div className="ml-auto flex items-center gap-4">
              <SocialLinks className="hidden sm:flex" />
              <div className="hidden sm:block"><CopyEmail email={email} /></div>
              {owner && <Link href="/review" className="chip hidden border-accent text-accent sm:inline-flex">Owner</Link>}
            </div>
          </div>
        </header>

        {/* tabIndex lets the skip link put keyboard focus here, so the next Tab lands in the content. */}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6">{children}</main>

        <footer className="site no-print border-t border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
          {/* In owner mode the floating "+" sits bottom-right; the extra bottom padding keeps it off Review / Sign out on phones. */}
          <div className={`mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 px-4 py-3 ${owner ? "pb-24 sm:pb-3" : ""}`}>
            <span className="inline-flex min-h-11 items-center">© {new Date().getFullYear()} {profile.name}</span>
            {email && <a href={`mailto:${email}`} className={flink}>{email}</a>}
            <SocialLinks />
            <Link href="/about" className={flink}>About</Link>
            <Link href="/archive" className={flink}>Archive</Link>
            <span className="ml-auto flex items-center gap-4">
              {owner ? (
                <>
                  <Link href="/review" className={flink}>Review</Link>
                  <form action={signOut}><button className={flink}>Sign out</button></form>
                </>
              ) : (
                <Suspense><SignInLink /></Suspense>
              )}
            </span>
          </div>
        </footer>

        {owner && <Suspense><AddSheet supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!} /></Suspense>}
      </body>
    </html>
  );
}
