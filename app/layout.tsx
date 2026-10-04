import type { Metadata, Viewport } from "next";
import Link from "next/link";
import CopyEmail from "@/components/CopyEmail";
import AddSheet from "@/components/owner/AddSheet";
import { contactEmail } from "@/lib/projects";
import { isOwner } from "@/lib/owner";
import { signOut } from "@/app/login/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Eli Lewis — Engineering portfolio", template: "%s · Eli Lewis" },
  description: "Engineering student at Northwestern and machinist at Ely Tool building custom tooling.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Eli Lewis", statusBarStyle: "default" },
  icons: { apple: "/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#c2410c", viewportFit: "cover" };
// The "+" intake action (image processing + Claude call, ~25 s) runs under whichever page opened the sheet.
export const maxDuration = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const email = contactEmail();
  const owner = await isOwner();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="site no-print sticky top-0 z-30 border-b border-neutral-200/80 bg-white/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
          <div className="mx-auto flex max-w-5xl items-center gap-x-5 px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">Eli Lewis</Link>
            <nav className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-300">
              <Link href="/work" className="hover:text-accent">Work</Link>
              <a href="/resume" className="hover:text-accent">Résumé</a>
            </nav>
            <div className="ml-auto hidden sm:block"><CopyEmail email={email} /></div>
            {owner && <Link href="/review" className="chip border-accent text-accent">Owner</Link>}
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

        <footer className="site no-print border-t border-neutral-200 text-sm text-neutral-500 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-6">
            <span>© {new Date().getFullYear()} Eli Lewis</span>
            {email && <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>}
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
