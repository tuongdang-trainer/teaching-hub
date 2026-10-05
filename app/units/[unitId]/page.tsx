import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type UnitDetail = {
  id: string;
  course_id: string;
  unit_number: number | null;
  title: string;
  description: string | null;
  objectives: string[] | null;
  course: {
    id: string;
    name: string;
    code: string | null;
  }[] | null;
  lessons: {
    id: string;
    title: string;
    lesson_number: number | null;
    status: string;
    duration: number | null;
  }[];
};

type PageProps = {
  params: Promise<{
    unitId: string;
  }>;
};

export default async function UnitDetailPage({
  params,
}: PageProps) {
  const { unitId } = await params;

  const supabase = await createClient();

  const { data: unit, error } = await supabase
    .from("curriculum_units")
    .select(`
      id,
      course_id,
      unit_number,
      title,
      description,
      objectives,
      course:courses (
        id,
        name,
        code
      ),
      lessons (
        id,
        title,
        lesson_number,
        status,
        duration
      )
    `)
    .eq("id", unitId)
    .maybeSingle();

  if (error) {
    return (
      <main className="space-y-6">
        <Link
          href="/units"
          className="text-sm text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Units
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Unable to load unit: {error.message}
          </p>
        </div>
      </main>
    );
  }

  if (!unit) {
    notFound();
  }

  const unitDetail = unit as unknown as UnitDetail;

  const course =
    unitDetail.course && unitDetail.course.length > 0
      ? unitDetail.course[0]
      : null;

  const lessons = [...(unitDetail.lessons ?? [])].sort(
    (a, b) =>
      (a.lesson_number ?? Number.MAX_SAFE_INTEGER) -
      (b.lesson_number ?? Number.MAX_SAFE_INTEGER),
  );

  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/units"
          className="text-sm text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Units
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-semibold text-gray-700">
              {unitDetail.unit_number ?? "—"}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {unitDetail.title}
              </h1>

              {course && (
                <p className="mt-1 text-sm text-gray-500">
                  {course.name}
                  {course.code ? ` · ${course.code}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/units/${unitDetail.id}/edit`}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Edit Unit
            </Link>

            <Link
              href={`/units/${unitDetail.id}/delete`}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete Unit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Unit Number</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {unitDetail.unit_number ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Lessons</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {lessons.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Objectives</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {unitDetail.objectives?.length ?? 0}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Description
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {unitDetail.description || "No description provided."}
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Learning Objectives
        </h2>

        {unitDetail.objectives &&
        unitDetail.objectives.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {unitDetail.objectives.map((objective, index) => (
              <li
                key={`${objective}-${index}`}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {index + 1}
                </span>

                <span>{objective}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">
            No learning objectives have been added.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Lessons
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Lessons assigned to this curriculum unit.
              </p>
            </div>

            <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
              {lessons.length}
            </span>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              No lessons are assigned to this unit yet.
            </p>

            <Link
              href="/lessons/new"
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Create Lesson
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/courses/${unitDetail.course_id}/units/${unitDetail.id}/lessons/${lesson.id}`}
                className="block px-6 py-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                      {lesson.lesson_number ?? "—"}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {lesson.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {lesson.duration && (
                          <span>{lesson.duration} min</span>
                        )}

                        <span className="rounded-full bg-gray-100 px-2 py-0.5">
                          {lesson.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm text-gray-400">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}