import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DeleteCoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function DeleteCoursePage({
  params,
}: DeleteCoursePageProps) {
  const { courseId } = await params;

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, name, code, description, level, provider")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Course not found
          </h1>

          <p className="mt-2 text-sm text-red-700">
            The course you are trying to delete could not be found.
          </p>

          <Link
            href="/courses"
            className="mt-5 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  const { count: unitCount, error: unitError } = await supabase
    .from("curriculum_units")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  async function deleteCourse() {
    "use server";

    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      redirect(
        `/courses/${courseId}/delete?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    redirect("/courses");
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Delete Course
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete this course?
            This action cannot be undone.
          </p>
        </div>

        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="font-semibold text-gray-900">
            {course.name}
          </p>

          {course.code && (
            <p className="mt-1 text-sm text-gray-500">
              {course.code}
            </p>
          )}

          {course.level && (
            <p className="mt-1 text-sm text-gray-500">
              Level: {course.level}
            </p>
          )}
        </div>

        {unitError ? (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              Unable to check curriculum units for this course.
            </p>

            <p className="mt-1 text-xs text-yellow-700">
              {unitError.message}
            </p>
          </div>
        ) : unitCount && unitCount > 0 ? (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-800">
              This course has {unitCount} curriculum{" "}
              {unitCount === 1 ? "unit" : "units"}.
            </p>

            <p className="mt-1 text-sm text-yellow-700">
              Deletion may be blocked if these units or their
              related lessons are still linked to the course.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <form action={deleteCourse}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Delete Course
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}