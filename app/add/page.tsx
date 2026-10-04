import { requireOwner } from "@/lib/owner";
import AddForm from "./AddForm";

export const metadata = { title: "Add", robots: { index: false } };
export const maxDuration = 60; // image processing + model call

export default async function AddPage() {
  await requireOwner("/add");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Add to portfolio</h1>
      <AddForm supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!} />
    </div>
  );
}
