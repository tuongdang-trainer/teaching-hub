import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ClassItem = {
  id: string;
  name: string;
  level: string | null;
  location: string | null;
  schedule: {
    description?: string;
  } | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  course:
    | {
        name: string;
        code: string | null;
      }[]
    | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";
  return value;
}

export default async function ClassesPage() {
  const supabase = await createClient();

  const { data: classes, error } = await supabase
    .from("classes")
    .select(
      `
        id,
        name,
        level,
        location,
        schedule,
        start_date,
        end_date,
        status,
        course:courses (
          name,
          code
        )
      `
    )
    .order("created_at", { ascending: false });

  const classList = (classes ?? []) as ClassItem[];

  const totalClasses = classList.length;

  const activeClasses = classList.filter(
    (item) => item.status === "active"
  ).length;

  const inactiveClasses = classList.filter(
    (item) => item.status === "inactive"
  ).length;

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Classes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your teaching groups and class schedules.
          </p>
        </div>

        <Link
          href="/classes/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Add Class
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load classes: {error.message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Classes
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalClasses}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {activeClasses}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {inactiveClasses}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            Your Classes
          </h2>
        </div>

        {classList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-medium">
              No classes yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first teaching class to get started.
            </p>

            <Link
              href="/classes/new"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              + Add Class
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 font-medium">
                    Class
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Course
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Level
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Schedule
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Location
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Start Date
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {classList.map((classItem) => (
                  <tr
                    key={classItem.id}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={"/classes/" + classItem.id}
                        className="font-medium hover:underline"
                      >
                        {classItem.name}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {classItem.course?.[0]?.name || "—"}

                      {classItem.course?.[0]?.code && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {classItem.course[0].code}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {classItem.level || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {classItem.schedule?.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {classItem.location || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {formatDate(classItem.start_date)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          classItem.status === "active"
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                        }
                      >
                        {formatStatus(classItem.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}