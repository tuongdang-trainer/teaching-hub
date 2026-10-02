import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateUnitForm from "@/components/courses/create-unit-form";

type CourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      "id, name, code, description, level, provider, duration, status, created_at"
    )
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    notFound();
  }

  const { data: units, error: unitsError } = await supabase
    .from("curriculum_units")
    .select(
      "id, course_id, parent_id, unit_number, title, description, objectives, created_at"
    )
    .eq("course_id", courseId)
    .is("parent_id", null)
    .order("unit_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="mb-3">
          <Link
            href="/courses"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Courses
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {course.name}
              </h1>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  course.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {course.status}
              </span>
            </div>

            {course.code && (
              <p className="mt-1 text-sm text-gray-500">
                {course.code}
              </p>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit Course
          </button>
        </div>
      </div>

      {/* Course Overview */}
      <section className="rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Course Overview
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Level
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {course.level || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Provider
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {course.provider || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Duration
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {course.duration || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Course Code
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {course.code || "—"}
            </p>
          </div>
        </div>

        {course.description && (
          <div className="border-t border-[#e7e9ed] px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Description
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {course.description}
            </p>
          </div>
        )}
      </section>

      {/* Curriculum */}
      <section className="rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Curriculum
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Organize this course into units, weeks, and lessons.
          </p>
        </div>

        {/* Add Unit */}
        <div className="border-b border-[#e7e9ed] bg-[#fafafa] p-6">
          <CreateUnitForm courseId={courseId} />
        </div>

        {/* Unit List */}
        <div className="p-6">
          {unitsError ? (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load curriculum units:{" "}
              {unitsError.message}
            </div>
          ) : units.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                +
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-800">
                No units yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Create your first unit or week using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {units.map((unit) => (
                <article
                  key={unit.id}
                  className="rounded-xl border border-[#e7e9ed] bg-white p-5 transition hover:border-gray-300"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                        {unit.unit_number ?? "—"}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {unit.title}
                        </h3>

                        {unit.description && (
                          <p className="mt-1 text-sm leading-6 text-gray-500">
                            {unit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/courses/${courseId}/units/${unit.id}`}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Open Unit
                    </Link>
                  </div>

                  {unit.objectives &&
                    Array.isArray(unit.objectives) &&
                    unit.objectives.length > 0 && (
                      <div className="mt-4 border-t border-[#e7e9ed] pt-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Learning Objectives
                        </p>

                        <ul className="mt-2 space-y-1">
                          {unit.objectives.map(
                            (objective: string, index: number) => (
                              <li
                                key={`${unit.id}-objective-${index}`}
                                className="text-sm text-gray-600"
                              >
                                • {objective}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}