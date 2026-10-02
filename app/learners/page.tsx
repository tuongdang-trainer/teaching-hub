
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
  current_level: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatLevel(level: string | null) {
  if (!level) return "—";

  return level
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function LearnersPage() {
  const supabase = await createClient();

  const { data: learners, error } = await supabase
    .from("learners")
    .select(
      "id, full_name, email, current_level, status, notes, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h1 className="font-semibold text-red-800">
            Unable to load learners
          </h1>

          <p className="mt-1 text-sm text-red-700">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  const learnerList = (learners ?? []) as Learner[];

  const activeCount = learnerList.filter(
    (learner) => learner.status === "active"
  ).length;

  const inactiveCount = learnerList.filter(
    (learner) => learner.status === "inactive"
  ).length;

  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Learners
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage learner profiles and learning information.
          </p>
        </div>

        <Link
          href="/learners/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + Add Learner
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Total Learners
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {learnerList.length}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Active
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {activeCount}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Search / Filter foundation */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search learners..."
          className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:max-w-md"
        />

        <select
          defaultValue="all"
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Learner Table */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {learnerList.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <h2 className="text-lg font-semibold">
              No learners yet
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Start building your learner database by adding your
              first learner profile.
            </p>

            <Link
              href="/learners/new"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              + Add Learner
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">
                    Learner
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Email
                  </th>

                  <th className="px-4 py-3 font-medium">
                    English Level
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {learnerList.map((learner) => {
                  const statusClass =
                    learner.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600";

                  return (
                    <tr
                      key={learner.id}
                      className="border-b last:border-0 transition hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={"/learners/" + learner.id}
                          className="font-medium hover:underline"
                        >
                          {learner.full_name}
                        </Link>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {learner.email || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {formatLevel(learner.current_level)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium " +
                            statusClass
                          }
                        >
                          {formatStatus(learner.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(learner.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
