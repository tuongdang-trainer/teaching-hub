"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import RecordAssessmentResultForm from "@/components/assessments/record-assessment-result-form";
import DeleteAssessmentButton from "@/components/assessments/delete-assessment-button";
import DeleteAssessmentResultButton from "@/components/assessments/delete-assessment-result-button";

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
  created_at: string;
  updated_at: string;
};

type Class = {
  id: string;
  name: string;
};

type AssessmentResult = {
  id: string;
  assessment_id: string;
  learner_id: string;
  score: number | null;
  percentage: number | null;
  feedback: string | null;
  strengths: string | null;
  areas_to_improve: string | null;
  created_at: string;
  updated_at: string;
};

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
  current_level: string | null;
  status: string | null;
};

type ClassEnrollment = {
  learner_id: string;
  status: string | null;
};

export default function AssessmentDetailPage() {
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId;

  const supabase = createClient();

  const [assessment, setAssessment] =
    useState<Assessment | null>(null);

  const [assessmentClass, setAssessmentClass] =
    useState<Class | null>(null);

  const [results, setResults] =
    useState<AssessmentResult[]>([]);

  const [learners, setLearners] =
    useState<Learner[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadAssessment() {
      if (!assessmentId) {
        return;
      }

      setLoading(true);
      setError("");

      const {
        data: assessmentData,
        error: assessmentError,
      } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (assessmentError) {
        setError(assessmentError.message);
        setLoading(false);
        return;
      }

      const typedAssessment =
        assessmentData as Assessment;

      setAssessment(typedAssessment);

      let classData: Class | null = null;

      if (typedAssessment.class_id) {
        const {
          data,
          error: classError,
        } = await supabase
          .from("classes")
          .select("id, name")
          .eq("id", typedAssessment.class_id)
          .maybeSingle();

        if (classError) {
          setError(classError.message);
          setLoading(false);
          return;
        }

        classData = data as Class | null;
      }

      setAssessmentClass(classData);

      const {
        data: resultData,
        error: resultError,
      } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", {
          ascending: false,
        });

      if (resultError) {
        setError(resultError.message);
        setLoading(false);
        return;
      }

      const typedResults =
        (resultData ?? []) as AssessmentResult[];

      setResults(typedResults);

      let learnerIds: string[] = [];

      if (typedAssessment.class_id) {
        const {
          data: enrollmentData,
          error: enrollmentError,
        } = await supabase
          .from("class_enrollments")
          .select("learner_id, status")
          .eq(
            "class_id",
            typedAssessment.class_id
          )
          .eq("status", "active");

        if (enrollmentError) {
          setError(enrollmentError.message);
          setLoading(false);
          return;
        }

        const enrollments =
          (enrollmentData ?? []) as ClassEnrollment[];

        learnerIds = enrollments.map(
          (enrollment) =>
            enrollment.learner_id
        );
      } else {
        const {
          data: learnerData,
          error: learnerError,
        } = await supabase
          .from("learners")
          .select(
            "id, full_name, email, current_level, status"
          )
          .eq("status", "active");

        if (learnerError) {
          setError(learnerError.message);
          setLoading(false);
          return;
        }

        const activeLearners =
          (learnerData ?? []) as Learner[];

        learnerIds = activeLearners.map(
          (learner) => learner.id
        );
      }

      for (const result of typedResults) {
        if (!learnerIds.includes(result.learner_id)) {
          learnerIds.push(result.learner_id);
        }
      }

      if (learnerIds.length > 0) {
        const {
          data: learnerData,
          error: learnerError,
        } = await supabase
          .from("learners")
          .select(
            "id, full_name, email, current_level, status"
          )
          .in("id", learnerIds);

        if (learnerError) {
          setError(learnerError.message);
          setLoading(false);
          return;
        }

        setLearners(
          (learnerData ?? []) as Learner[]
        );
      } else {
        setLearners([]);
      }

      setLoading(false);
    }

    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <main className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Loading assessment...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <Link
          href="/assessments"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessments
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!assessment) {
    return (
      <main className="space-y-6">
        <Link
          href="/assessments"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessments
        </Link>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">
            Assessment not found.
          </p>
        </div>
      </main>
    );
  }

  const learnerMap = new Map(
    learners.map((learner) => [
      learner.id,
      learner,
    ])
  );

  const percentages = results
    .map((result) => result.percentage)
    .filter(
      (value): value is number =>
        typeof value === "number"
    );

  const average =
    percentages.length > 0
      ? percentages.reduce(
          (sum, value) => sum + value,
          0
        ) / percentages.length
      : null;

  const highest =
    percentages.length > 0
      ? Math.max(...percentages)
      : null;

  const lowest =
    percentages.length > 0
      ? Math.min(...percentages)
      : null;

  const resultLearnerIds = new Set(
    results.map((result) => result.learner_id)
  );

  const learnersWithoutResults =
    learners.filter(
      (learner) =>
        !resultLearnerIds.has(learner.id)
    );

  function formatDate(date: string | null) {
    if (!date) {
      return "—";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <main className="space-y-8">
      <section className="space-y-4">
        <Link
          href="/assessments"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessments
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {assessment.type}
              </span>

              {assessmentClass && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {assessmentClass.name}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              {assessment.name}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {assessment.description ||
                "Assessment details and learner results."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/assessments/${assessmentId}/edit`}
              className="inline-flex rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Edit Assessment
            </Link>

            <DeleteAssessmentButton
              assessmentId={assessment.id}
              assessmentName={assessment.name}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Average
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {average !== null
              ? `${average.toFixed(1)}%`
              : "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Highest
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {highest !== null
              ? `${highest.toFixed(1)}%`
              : "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Lowest
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {lowest !== null
              ? `${lowest.toFixed(1)}%`
              : "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Results Recorded
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {results.length}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h2 className="text-lg font-semibold">
            Assessment Information
          </h2>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Type
            </p>

            <p className="mt-1 text-sm">
              {assessment.type}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class
            </p>

            <p className="mt-1 text-sm">
              {assessmentClass?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </p>

            <p className="mt-1 text-sm">
              {formatDate(assessment.date)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Maximum Score
            </p>

            <p className="mt-1 text-sm">
              {assessment.max_score ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Created
            </p>

            <p className="mt-1 text-sm">
              {new Date(
                assessment.created_at
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </section>

      <RecordAssessmentResultForm
        assessmentId={assessmentId}
        maxScore={assessment.max_score}
        learners={learnersWithoutResults.map(
          (learner) => ({
            id: learner.id,
            full_name: learner.full_name,
            email: learner.email,
          })
        )}
      />

      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              Learner Results
            </h2>

            <p className="text-sm text-muted-foreground">
              {results.length} result
              {results.length === 1 ? "" : "s"} recorded
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No learner results recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Learner
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Score
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Percentage
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Feedback
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {results.map((result) => {
                  const learner =
                    learnerMap.get(
                      result.learner_id
                    );

                  return (
                    <tr key={result.id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium">
                            {learner?.full_name ??
                              "Unknown learner"}
                          </p>

                          {learner?.email && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {learner.email}
                            </p>
                          )}

                          {learner?.current_level && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Level:{" "}
                              {learner.current_level}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {result.score !== null
                            ? assessment.max_score !==
                              null
                              ? `${result.score} / ${assessment.max_score}`
                              : result.score
                            : "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {result.percentage !== null
                            ? `${Number(
                                result.percentage
                              ).toFixed(1)}%`
                            : "—"}
                        </p>
                      </td>

                      <td className="max-w-md px-6 py-4">
                        <p className="truncate text-sm">
                          {result.feedback || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            href={`/assessments/${assessmentId}/results/${result.id}/edit`}
                            className="inline-flex rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                          >
                            Edit
                          </Link>

                          <DeleteAssessmentResultButton
                            resultId={result.id}
                            learnerName={
                              learner?.full_name ??
                              "this learner"
                            }
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