import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DeleteLearnerPageProps = {
  params: Promise<{
    learnerId: string;
  }>;
};

export default async function DeleteLearnerPage({
  params,
}: DeleteLearnerPageProps) {
  const { learnerId } = await params;

  const supabase = await createClient();

  const { data: learner, error: learnerError } = await supabase
    .from("learners")
    .select("id, full_name, email")
    .eq("id", learnerId)
    .single();

  if (learnerError || !learner) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Learner not found
          </h1>

          <p className="mt-2 text-sm text-red-700">
            The learner you are trying to delete could not be found.
          </p>

          <Link
            href="/learners"
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to Learners
          </Link>
        </div>
      </main>
    );
  }

  async function deleteLearner() {
    "use server";

    const supabase = await createClient();

    const { error } = await supabase
      .from("learners")
      .delete()
      .eq("id", learnerId);

    if (error) {
      return redirect(
        `/learners/${learnerId}/delete?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    redirect("/learners");
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="text-xl font-semibold">
            Delete Learner
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Are you sure you want to delete this learner?
            This action cannot be undone.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-medium">{learner.full_name}</p>

          {learner.email && (
            <p className="mt-1 text-sm text-muted-foreground">
              {learner.email}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/learners"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <form action={deleteLearner}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Delete Learner
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}