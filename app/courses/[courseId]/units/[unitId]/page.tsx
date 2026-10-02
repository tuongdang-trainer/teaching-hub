import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateLessonForm from "@/components/lessons/create-lesson-form";

type UnitDetailPageProps = {
  params: Promise<{
    courseId: string;
    unitId: string;
  }>;
};

export default async function UnitDetailPage({
  params,
}: UnitDetailPageProps) {
  const { courseId, unitId } = await params;

  const supabase = await createClient();

  const { data: unit, error: unitError } = await supabase
    .from("curriculum_units")
    .select(
      "id, course_id, parent_id, unit_number, title, description, objectives, created_at"
    )
    .eq("id", unitId)
    .eq("course_id", courseId)
    .single();

  if (unitError || !unit) {
    notFound();
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, name, code")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    notFound();
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select(
      "id, unit_id, lesson_number, title, topic, duration, objective, language_focus, vocabulary_focus, skill_focus, status, scheduled_at, created_at"
    )
    .eq("unit_id", unitId)
    .order("lesson_number", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: true,
    });

  return (
    <main className="space-y-6 p-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link
          href="/courses"
          className="hover:text-gray-900"
        >
          Courses
        </Link>

        <span>›</span>

        <Link
          href={`/courses/${courseId}`}
          className="hover:text-gray-900"
        >
          {course.name}
        </Link>

        <span>›</span>

        <span className="text-gray-900">
          {unit.title}
        </span>
      </div>

      {/* Header */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                {unit.unit_number ?? "—"}
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {course.name}
                  {course.code ? ` · ${course.code}` : ""}
                </p>

                <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                  {unit.title}
                </h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit Unit
          </button>
        </div>
      </section>

      {/* Unit Overview */}
      <section className="rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Unit Overview
          </h2>
        </div>

        <div className="p-6">
          {unit.description && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {unit.description}
              </p>
            </div>
          )}

          {unit.objectives &&
            Array.isArray(unit.objectives) &&
            unit.objectives.length > 0 && (
              <div
                className={
                  unit.description ? "mt-6" : ""
                }
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Learning Objectives
                </p>

                <ul className="mt-3 space-y-2">
                  {unit.objectives.map(
                    (objective: string, index: number) => (
                      <li
                        key={`${unit.id}-objective-${index}`}
                        className="flex gap-2 text-sm text-gray-600"
                      >
                        <span className="text-gray-400">
                          •
                        </span>

                        <span>{objective}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      </section>

      {/* Lessons */}
      <section className="rounded-xl border border-[#e7e9ed] bg-white">
        <div className="border-b border-[#e7e9ed] px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Lessons
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Build the lessons that belong to this unit.
          </p>
        </div>

        {/* Add Lesson */}
        <div className="border-b border-[#e7e9ed] bg-[#fafafa] p-6">
          <CreateLessonForm
            courseId={courseId}
            unitId={unitId}
          />
        </div>

        {/* Lesson List */}
        <div className="p-6">
          {lessonsError ? (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load lessons: {lessonsError.message}
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                +
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-800">
                No lessons yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Create your first lesson using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <article
                  key={lesson.id}
                  className="rounded-xl border border-[#e7e9ed] bg-white p-5 transition hover:border-gray-300"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                        {lesson.lesson_number ?? "—"}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {lesson.title}
                        </h3>

                        {lesson.topic && (
                          <p className="mt-1 text-sm text-gray-500">
                            {lesson.topic}
                          </p>
                        )}

                        {lesson.objective && (
                          <p className="mt-2 text-sm leading-6 text-gray-500">
                            {lesson.objective}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {lesson.duration && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              {lesson.duration} min
                            </span>
                          )}

                          {lesson.status && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              {lesson.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${courseId}/units/${unitId}/lessons/${lesson.id}`}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Open Lesson
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}