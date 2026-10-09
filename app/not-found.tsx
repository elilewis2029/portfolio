import Link from "next/link";
import { contactEmail } from "@/lib/projects";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  const email = contactEmail();
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-xs uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">That page isn’t here</h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">It may have been unpublished or moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/projects" className="btn btn-primary">See the projects</Link>
        <Link href="/" className="btn">Home</Link>
        {email && <a href={`mailto:${email}`} className="btn">Email me</a>}
      </div>
    </div>
  );
}
