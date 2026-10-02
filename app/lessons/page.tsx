import Link from "next/link";

import DeleteLessonButton from "@/components/lessons/delete-lesson-button";
import { createClient } from "@/lib/supabase/server";

type LessonItem = {
  id: string;
  course_id: string;
  unit_id: string;
  lesson_number: number | null;
  title: string;
  topic: string | null;
  duration: number | null;
  skill_focus: string | null;
  status: string;
  scheduled_at: string | null;
  course:
    | {
        name: string;
        code: string | null;
      }[]
    | null;
  unit:
    | {
        unit_number: number | null;
        title: string;
      }[]
    | null;
};

function formatStatus(value: string) {
  if (value === "draft") return "Draft";
  if (value === "planned") return "Planned";
  if (value === "ready") return "Ready";
  if (value === "completed") return "Completed";
  return value;
}

function getStatusClassName(value: string) {
  if (value === "completed") {
    return "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700";
  }

  if (value === "ready") {
    return "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700";
  }

  if (value === "planned") {
    return "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700";
  }

  return "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700";
}

function formatScheduledAt(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LessonsPage() {
  const supabase = await createClient();

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select(
      `
        id,
        course_id,
        unit_id,
        lesson_number,
        title,
        topic,
        duration,
        skill_focus,
        status,
        scheduled_at,
        course:courses (
          name,
          code
        ),
        unit:curriculum_units (
          unit_number,
          title
        )
      `
    )
    .order("created_at", { ascending: false });

  const lessonList = (lessons ?? []) as LessonItem[];

  const totalLessons = lessonList.length;

  const draftLessons = lessonList.filter(
    (lesson) => lesson.status === "draft"
  ).length;

  const plannedLessons = lessonList.filter(
    (lesson) => lesson.status === "planned"
  ).length;

  const readyLessons = lessonList.filter(
    (lesson) => lesson.status === "ready"
  ).length;

  const completedLessons = lessonList.filter(
    (lesson) => lesson.status === "completed"
  ).length;

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Lessons
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Plan, prepare, teach, and review your lessons.
          </p>
        </div>

        <Link
          href="/lessons/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Create Lesson
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load lessons: {error.message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Lessons
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalLessons}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Draft
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {draftLessons}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Planned
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {plannedLessons}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Ready
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {readyLessons}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Completed
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {completedLessons}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            All Lessons
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Browse lessons across your courses and units.
          </p>
        </div>

        {lessonList.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-medium">
              No lessons yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first lesson to start building your
              teaching plan.
            </p>

            <Link
              href="/lessons/new"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              + Create Lesson
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 font-medium">
                    Lesson
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Course
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Unit
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Duration
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Skill
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Scheduled
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {lessonList.map((lesson) => {
                  const course = lesson.course?.[0];
                  const unit = lesson.unit?.[0];

                  return (
                    <tr
                      key={lesson.id}
                      className="border-b last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/courses/${lesson.course_id}/units/${lesson.unit_id}/lessons/${lesson.id}`}
                          className="font-medium hover:underline"
                        >
                          {lesson.lesson_number
                            ? `Lesson ${lesson.lesson_number}: `
                            : ""}
                          {lesson.title}
                        </Link>

                        {lesson.topic && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {lesson.topic}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          {course?.name || "—"}
                        </div>

                        {course?.code && (
                          <span className="text-xs text-muted-foreground">
                            {course.code}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {unit ? (
                          <div>
                            <div>
                              {unit.unit_number
                                ? `Unit ${unit.unit_number}`
                                : "Unit"}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {unit.title}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {lesson.duration
                          ? `${lesson.duration} min`
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        {lesson.skill_focus || "—"}
                      </td>

                      <td className="px-6 py-4">
                        {formatScheduledAt(
                          lesson.scheduled_at
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={getStatusClassName(
                            lesson.status
                          )}
                        >
                          {formatStatus(lesson.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/courses/${lesson.course_id}/units/${lesson.unit_id}/lessons/${lesson.id}`}
                            className="font-medium hover:underline"
                          >
                            View
                          </Link>

                          <DeleteLessonButton
                            lessonId={lesson.id}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}