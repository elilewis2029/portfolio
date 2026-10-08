import Link from "next/link";
import { sendLink, verifyCode } from "./actions";

export const metadata = { title: "Sign in", robots: { index: false } };

type SP = { next?: string; sent?: string; error?: string; email?: string };

export default async function Login({ searchParams }: { searchParams: Promise<SP> }) {
  const { next = "/", sent, error, email = "" } = await searchParams;
  // Where "Back" goes: the page you came from, unless it is owner-only (you'd just bounce back here).
  const back = /^\/(review|add)(\/|$|\?)|[?&]edit=1/.test(next) ? "/" : next;
  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-4 text-sm"><Link href={back} className="inline-flex min-h-11 items-center text-accent hover:underline">← Back to the site</Link></p>
      <h1 className="mb-1 text-xl font-semibold">Owner sign-in</h1>
      <p className="mb-4 text-sm text-neutral-500">Only the site owner can sign in. Nothing here for visitors.</p>
      {next.includes("edit=1") && (
        <p className="mb-4 rounded-md border border-yellow-500/60 p-2 text-sm">
          You were signed out, so that change was not saved yet. Sign in and you&rsquo;ll go back to the editor with your edits restored.
        </p>
      )}
      {sent ? (
        <form action={verifyCode} className="space-y-3">
          <p className="text-sm">Check your email and tap the sign-in link. If the email shows a code instead, type it here.</p>
          <input type="hidden" name="next" value={next} />
          <input name="email" type="email" required defaultValue={email} className="input" />
          <input name="token" inputMode="numeric" autoComplete="one-time-code" placeholder="Code from the email" className="input" required />
          <button className="btn btn-primary w-full">Sign in with code</button>
          {error && <p className="text-sm text-red-600">That code or link didn&rsquo;t work. Request a new one.</p>}
        </form>
      ) : (
        <form action={sendLink} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input name="email" type="email" required placeholder="you@example.com" className="input" autoComplete="email" />
          <button className="btn btn-primary w-full">Email me a sign-in link</button>
          {error && <p className="text-sm text-red-600">That link didn&rsquo;t work. Try again.</p>}
        </form>
      )}
    </div>
  );
}
