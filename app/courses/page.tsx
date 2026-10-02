import { createClient } from "@/lib/supabase/server";
import CreateCourseForm from "@/components/courses/create-course-form";

export default async function CoursesPage() {
  const supabase = await createClient();

  const {
    data: courses,
    error,
  } = await supabase
    .from("courses")
    .select(
      "id, name, code, description, level, provider, duration, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h1 className="text-lg font-semibold text-red-800">
            Unable to load courses
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Courses
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage courses and teaching programs.
        </p>
      </div>

      <CreateCourseForm />

      {courses.length === 0 ? (
        <section className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-base font-semibold text-gray-800">
            No courses yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first course to start building your curriculum.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-[#e7e9ed] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-[#e7e9ed] bg-[#fafafa]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Course
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Level
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Provider
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Duration
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e7e9ed]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#fafafa]">
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {course.name}
                        </div>

                        {course.code && (
                          <div className="mt-1 text-xs text-gray-500">
                            {course.code}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {course.level || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {course.provider || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {course.duration || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          course.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}