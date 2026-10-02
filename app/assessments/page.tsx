import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Assessment = {
  id: string;
  name: string;
  type: string;
  course_id: string | null;
  class_id: string | null;
  lesson_id: string | null;
  max_score: number | null;
  date: string | null;
  description: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
};

type AssessmentResult = {
  assessment_id: string;
};

export default async function AssessmentsPage() {
  const supabase = await createClient();

  const { data: assessments, error: assessmentsError } =
    await supabase
      .from("assessments")
      .select(
        "id, name, type, course_id, class_id, lesson_id, max_score, date, description"
      )
      .order("date", { ascending: false });

  const { data: classes, error: classesError } =
    await supabase
      .from("classes")
      .select("id, name")
      .order("name", { ascending: true });

  const assessmentList =
    (assessments as Assessment[]) ?? [];

  const classList =
    (classes as ClassInfo[]) ?? [];

  const assessmentIds = assessmentList.map(
    (assessment) => assessment.id
  );

  let resultList: AssessmentResult[] = [];

  if (assessmentIds.length > 0) {
    const { data: results } = await supabase
      .from("assessment_results")
      .select("assessment_id")
      .in("assessment_id", assessmentIds);

    resultList =
      (results as AssessmentResult[]) ?? [];
  }

  const resultCountByAssessment = new Map<
    string,
    number
  >();

  resultList.forEach((result) => {
    const current =
      resultCountByAssessment.get(
        result.assessment_id
      ) ?? 0;

    resultCountByAssessment.set(
      result.assessment_id,
      current + 1
    );
  });

  const classMap = new Map(
    classList.map((classItem) => [
      classItem.id,
      classItem.name,
    ])
  );

  const totalAssessments =
    assessmentList.length;

  const assessmentsWithResults =
    assessmentList.filter(
      (assessment) =>
        (resultCountByAssessment.get(
          assessment.id
        ) ?? 0) > 0
    ).length;

  const totalResults =
    resultList.length;

  function formatDate(date: string | null) {
    if (!date) {
      return "—";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Assessments
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create assessments and track learner results.
          </p>
        </div>

        <Link
          href="/assessments/new"
          className="inline-flex w-fit rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90"
        >
          Create Assessment
        </Link>
      </div>

      {/* Errors */}
      {assessmentsError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load assessments:{" "}
          {assessmentsError.message}
        </div>
      )}

      {classesError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load classes:{" "}
          {classesError.message}
        </div>
      )}

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Assessments
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalAssessments}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Assessments with Results
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {assessmentsWithResults}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Results Recorded
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalResults}
          </p>
        </div>
      </section>

      {/* Assessment List */}
      <section>
        <div className="mb-4">
          <h2 className="font-semibold">
            Assessment List
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Review assessments and their recorded learner results.
          </p>
        </div>

        {assessmentList.length === 0 ? (
          <div className="rounded-xl border bg-card px-6 py-12 text-center">
            <h3 className="font-medium">
              No assessments yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first assessment to start tracking learner results.
            </p>

            <Link
              href="/assessments/new"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Create Assessment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 font-medium">
                    Assessment
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Type
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Class
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-6 py-3 text-center font-medium">
                    Max Score
                  </th>

                  <th className="px-6 py-3 text-center font-medium">
                    Results
                  </th>

                  <th className="px-6 py-3 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {assessmentList.map(
                  (assessment) => {
                    const resultCount =
                      resultCountByAssessment.get(
                        assessment.id
                      ) ?? 0;

                    const className =
                      assessment.class_id
                        ? classMap.get(
                            assessment.class_id
                          ) ?? "Unknown Class"
                        : "—";

                    return (
                      <tr
                        key={assessment.id}
                        className="border-b last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {assessment.name}
                            </p>

                            {assessment.description && (
                              <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                {assessment.description}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {assessment.type}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {className}
                        </td>

                        <td className="px-6 py-4">
                          {formatDate(
                            assessment.date
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {assessment.max_score ??
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {resultCount}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/assessments/${assessment.id}`}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}