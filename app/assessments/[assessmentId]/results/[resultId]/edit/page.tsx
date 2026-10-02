"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Assessment = {
  id: string;
  name: string;
  max_score: number | null;
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
};

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
};

export default function EditAssessmentResultPage() {
  const params = useParams<{
    assessmentId: string;
    resultId: string;
  }>();

  const router = useRouter();
  const supabase = createClient();

  const assessmentId = params.assessmentId;
  const resultId = params.resultId;

  const [assessment, setAssessment] =
    useState<Assessment | null>(null);

  const [result, setResult] =
    useState<AssessmentResult | null>(null);

  const [learner, setLearner] =
    useState<Learner | null>(null);

  const [score, setScore] = useState("");
  const [percentage, setPercentage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areasToImprove, setAreasToImprove] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const { data: assessmentData, error: assessmentError } =
        await supabase
          .from("assessments")
          .select("id, name, max_score")
          .eq("id", assessmentId)
          .single();

      if (assessmentError || !assessmentData) {
        setError(
          assessmentError?.message ??
            "Assessment not found."
        );
        setLoading(false);
        return;
      }

      const { data: resultData, error: resultError } =
        await supabase
          .from("assessment_results")
          .select(
            "id, assessment_id, learner_id, score, percentage, feedback, strengths, areas_to_improve"
          )
          .eq("id", resultId)
          .eq("assessment_id", assessmentId)
          .single();

      if (resultError || !resultData) {
        setError(
          resultError?.message ??
            "Assessment result not found."
        );
        setLoading(false);
        return;
      }

      const { data: learnerData, error: learnerError } =
        await supabase
          .from("learners")
          .select("id, full_name, email")
          .eq("id", resultData.learner_id)
          .single();

      if (learnerError || !learnerData) {
        setError(
          learnerError?.message ??
            "Learner not found."
        );
        setLoading(false);
        return;
      }

      const typedAssessment =
        assessmentData as Assessment;

      const typedResult =
        resultData as AssessmentResult;

      const typedLearner =
        learnerData as Learner;

      setAssessment(typedAssessment);
      setResult(typedResult);
      setLearner(typedLearner);

      setScore(
        typedResult.score !== null
          ? String(typedResult.score)
          : ""
      );

      setPercentage(
        typedResult.percentage !== null
          ? String(typedResult.percentage)
          : ""
      );

      setFeedback(
        typedResult.feedback ?? ""
      );

      setStrengths(
        typedResult.strengths ?? ""
      );

      setAreasToImprove(
        typedResult.areas_to_improve ?? ""
      );

      setLoading(false);
    }

    loadData();
  }, [assessmentId, resultId]);

  function handleScoreChange(value: string) {
    setScore(value);

    if (
      !assessment ||
      assessment.max_score === null ||
      assessment.max_score <= 0
    ) {
      return;
    }

    const numericScore = Number(value);

    if (
      value === "" ||
      Number.isNaN(numericScore) ||
      numericScore < 0
    ) {
      setPercentage("");
      return;
    }

    const calculatedPercentage =
      (numericScore / assessment.max_score) * 100;

    const roundedPercentage =
      Math.round(calculatedPercentage * 100) / 100;

    setPercentage(
      roundedPercentage.toString()
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!assessment || !result) {
      return;
    }

    setError("");

    const numericScore =
      score.trim() === ""
        ? null
        : Number(score);

    const numericPercentage =
      percentage.trim() === ""
        ? null
        : Number(percentage);

    if (
      numericScore !== null &&
      (Number.isNaN(numericScore) ||
        numericScore < 0)
    ) {
      setError(
        "Score must be a valid number greater than or equal to 0."
      );
      return;
    }

    if (
      assessment.max_score !== null &&
      numericScore !== null &&
      numericScore > assessment.max_score
    ) {
      setError(
        `Score cannot be greater than the maximum score of ${assessment.max_score}.`
      );
      return;
    }

    if (
      numericPercentage !== null &&
      (Number.isNaN(numericPercentage) ||
        numericPercentage < 0 ||
        numericPercentage > 100)
    ) {
      setError(
        "Percentage must be between 0 and 100."
      );
      return;
    }

    setSaving(true);

    const { error: updateError } =
      await supabase
        .from("assessment_results")
        .update({
          score: numericScore,
          percentage: numericPercentage,
          feedback:
            feedback.trim() || null,
          strengths:
            strengths.trim() || null,
          areas_to_improve:
            areasToImprove.trim() || null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", result.id)
        .eq("assessment_id", assessmentId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push(
      `/assessments/${assessmentId}`
    );
    router.refresh();
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Loading assessment result...
        </p>
      </main>
    );
  }

  if (error && (!assessment || !result || !learner)) {
    return (
      <main className="space-y-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/assessments/${assessmentId}`
            )
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessment
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!assessment || !result || !learner) {
    return null;
  }

  return (
    <main className="max-w-3xl space-y-8">
      <div>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/assessments/${assessmentId}`
            )
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessment
        </button>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Assessment Result
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the recorded result for this learner.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Assessment
            </p>
            <p className="mt-1 text-sm font-medium">
              {assessment.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Learner
            </p>
            <p className="mt-1 text-sm font-medium">
              {learner.full_name}
            </p>

            {learner.email && (
              <p className="mt-1 text-xs text-muted-foreground">
                {learner.email}
              </p>
            )}
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5">
            <h2 className="font-semibold">
              Result
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update the learner&apos;s score and assessment result.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="score"
                className="block text-sm font-medium"
              >
                Score
              </label>

              <input
                id="score"
                type="number"
                min="0"
                step="any"
                value={score}
                onChange={(event) =>
                  handleScoreChange(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={
                  assessment.max_score !== null
                    ? `e.g. ${assessment.max_score}`
                    : "Enter score"
                }
              />

              {assessment.max_score !== null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum score:{" "}
                  {assessment.max_score}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="percentage"
                className="block text-sm font-medium"
              >
                Percentage
              </label>

              <input
                id="percentage"
                type="number"
                min="0"
                max="100"
                step="any"
                value={percentage}
                onChange={(event) =>
                  setPercentage(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 80"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Automatically calculated when Score is entered.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <div className="mb-5">
            <h2 className="font-semibold">
              Feedback
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add feedback and learning observations for this learner.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium"
              >
                Feedback
              </label>

              <textarea
                id="feedback"
                value={feedback}
                onChange={(event) =>
                  setFeedback(
                    event.target.value
                  )
                }
                rows={4}
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Overall feedback..."
              />
            </div>

            <div>
              <label
                htmlFor="strengths"
                className="block text-sm font-medium"
              >
                Strengths
              </label>

              <textarea
                id="strengths"
                value={strengths}
                onChange={(event) =>
                  setStrengths(
                    event.target.value
                  )
                }
                rows={4}
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="What does the learner do well?"
              />
            </div>

            <div>
              <label
                htmlFor="areasToImprove"
                className="block text-sm font-medium"
              >
                Areas to Improve
              </label>

              <textarea
                id="areasToImprove"
                value={areasToImprove}
                onChange={(event) =>
                  setAreasToImprove(
                    event.target.value
                  )
                }
                rows={4}
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="What should the learner improve?"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/assessments/${assessmentId}`
              )
            }
            disabled={saving}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
