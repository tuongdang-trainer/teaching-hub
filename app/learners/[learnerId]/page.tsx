import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
  current_level: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type EnrolledClass = {
  id: string;
  enrolled_at: string;
  status: string;
  class: {
    id: string;
    name: string;
    level: string | null;
    location: string | null;
    schedule: {
      description?: string;
    } | null;
    status: string;
    course: {
      name: string;
      code: string | null;
    }[] | null;
  }[] | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
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

function formatLevel(value: string | null) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function LearnerDetailPage({
  params,
}: {
  params: Promise<{ learnerId: string }>;
}) {
  const { learnerId } = await params;

  const supabase = await createClient();

  const { data: learnerData, error: learnerError } = await supabase
    .from("learners")
    .select(
      `
        id,
        full_name,
        email,
        current_level,
        status,
        notes,
        created_at,
        updated_at
      `
    )
    .eq("id", learnerId)
    .maybeSingle();

  if (learnerError || !learnerData) {
    notFound();
  }

  const learner = learnerData as Learner;

  const { data: enrollmentData } = await supabase
    .from("class_enrollments")
    .select(
      `
        id,
        enrolled_at,
        status,
        class:classes (
          id,
          name,
          level,
          location,
          schedule,
          status,
          course:courses (
            name,
            code
          )
        )
      `
    )
    .eq("learner_id", learnerId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  const enrolledClasses: EnrolledClass[] = (enrollmentData ??
    []) as EnrolledClass[];

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/learners"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Learners
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {learner.full_name}
              </h1>

              <span
                className={
                  learner.status === "active"
                    ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                    : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                }
              >
                {formatStatus(learner.status)}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Learner Profile
            </p>
          </div>

          <button
            type="button"
            disabled
            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground opacity-60"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Overview */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Overview</h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Full Name
            </p>

            <p className="mt-1 font-medium">
              {learner.full_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p className="mt-1 font-medium">
              {learner.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              English Level
            </p>

            <p className="mt-1 font-medium">
              {formatLevel(learner.current_level)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="mt-1 font-medium">
              {formatStatus(learner.status)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Created
            </p>

            <p className="mt-1 font-medium">
              {formatDate(learner.created_at)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Last Updated
            </p>

            <p className="mt-1 font-medium">
              {formatDate(learner.updated_at)}
            </p>
          </div>
        </div>

        {learner.notes && (
          <div className="border-t px-6 py-5">
            <p className="text-sm text-muted-foreground">
              Notes
            </p>

            <p className="mt-1 text-sm">
              {learner.notes}
            </p>
          </div>
        )}
      </section>

      {/* Classes */}
      <section className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Classes</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {enrolledClasses.length} active class
              {enrolledClasses.length === 1 ? "" : "es"}
            </p>
          </div>
        </div>

        {enrolledClasses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-medium">
              No active classes
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              This learner is not currently enrolled in any class.
            </p>
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
                    Enrolled
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {enrolledClasses.map((enrollment) => {
                  const classItem =
                    enrollment.class?.[0] ?? null;

                  if (!classItem) {
                    return null;
                  }

                  const course =
                    classItem.course?.[0] ?? null;

                  return (
                    <tr
                      key={enrollment.id}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/classes/${classItem.id}`}
                          className="font-medium hover:underline"
                        >
                          {classItem.name}
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p>
                            {course?.name || "—"}
                          </p>

                          {course?.code && (
                            <p className="text-xs text-muted-foreground">
                              {course.code}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {classItem.level || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {classItem.schedule?.description ||
                          "—"}
                      </td>

                      <td className="px-6 py-4">
                        {formatDate(enrollment.enrolled_at)}
                      </td>

                      <td className="px-6 py-4">
                        {formatStatus(enrollment.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Learning Snapshot */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Attendance</h2>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Attendance tracking will appear here.
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Progress</h2>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Learning progress will appear here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}