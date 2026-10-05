import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type CurriculumUnit = {
  id: string;
  course_id: string;
  unit_number: number | null;
  title: string;
  description: string | null;
  objectives: string[] | null;
  course: {
    name: string;
    code: string | null;
  }[] | null;
  lessons: {
    id: string;
  }[];
};

export default async function UnitsPage() {
  const supabase = await createClient();

  const { data: units, error } = await supabase
    .from("curriculum_units")
    .select(`
      id,
      course_id,
      unit_number,
      title,
      description,
      objectives,
      course:courses (
        name,
        code
      ),
      lessons (
        id
      )
    `)
    .order("course_id", { ascending: true })
    .order("unit_number", { ascending: true });

  if (error) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Units
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize curriculum units and learning objectives.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Unable to load units: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const unitList = (units ?? []) as unknown as CurriculumUnit[];

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Units
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize curriculum units and learning objectives.
          </p>
        </div>

        <Link
          href="/units/new"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Create Unit
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Units</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {unitList.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Courses</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {new Set(
              unitList.map((unit) => unit.course_id),
            ).size}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Lessons</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {unitList.reduce(
              (total, unit) =>
                total + (unit.lessons?.length ?? 0),
              0,
            )}
          </p>
        </div>
      </div>

      {unitList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No units yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Create your first curriculum unit to start organizing
            lessons within a course.
          </p>

          <Link
            href="/units/new"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Create First Unit
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unit
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Course
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </th>

                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Lessons
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {unitList.map((unit) => (
                  <tr
                    key={unit.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/units/${unit.id}`}
                        className="block"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                            {unit.unit_number ?? "—"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {unit.title}
                            </p>

                            {unit.objectives &&
                              unit.objectives.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {unit.objectives.length}{" "}
                                  objective
                                  {unit.objectives.length !== 1
                                    ? "s"
                                    : ""}
                                </p>
                              )}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {unit.course &&
                      unit.course.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {unit.course[0].name}
                          </p>

                          {unit.course[0].code && (
                            <p className="mt-1 text-xs text-gray-500">
                              {unit.course[0].code}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No course
                        </span>
                      )}
                    </td>

                    <td className="max-w-md px-6 py-4">
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {unit.description ||
                          "No description"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
                        {unit.lessons?.length ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}