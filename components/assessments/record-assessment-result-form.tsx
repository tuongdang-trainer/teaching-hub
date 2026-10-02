"use client";

import { useState } from "react";


import { createClient } from "@/lib/supabase/client";

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
};

type RecordAssessmentResultFormProps = {
  assessmentId: string;
  maxScore: number | null;
  learners: Learner[];
};

export default function RecordAssessmentResultForm({
  assessmentId,
  maxScore,
  learners,
}: RecordAssessmentResultFormProps) {

  const supabase = createClient();

  const [learnerId, setLearnerId] = useState("");
  const [score, setScore] = useState("");
  const [percentage, setPercentage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areasToImprove, setAreasToImprove] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleScoreChange(value: string) {
    setScore(value);

    if (
      value.trim() === "" ||
      maxScore === null ||
      maxScore <= 0
    ) {
      return;
    }

    const numericScore = Number(value);

    if (
      Number.isFinite(numericScore) &&
      numericScore >= 0 &&
      numericScore <= maxScore
    ) {
      const calculatedPercentage =
        (numericScore / maxScore) * 100;

      setPercentage(
        calculatedPercentage.toFixed(1)
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!learnerId) {
      setError("Please select a learner.");
      return;
    }

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
      !Number.isFinite(numericScore)
    ) {
      setError("Score must be a valid number.");
      return;
    }

    if (
      numericScore !== null &&
      numericScore < 0
    ) {
      setError("Score cannot be negative.");
      return;
    }

    if (
      maxScore !== null &&
      numericScore !== null &&
      numericScore > maxScore
    ) {
      setError(
        `Score cannot be higher than ${maxScore}.`
      );
      return;
    }

    if (
      numericPercentage !== null &&
      !Number.isFinite(numericPercentage)
    ) {
      setError(
        "Percentage must be a valid number."
      );
      return;
    }

    if (
      numericPercentage !== null &&
      (numericPercentage < 0 ||
        numericPercentage > 100)
    ) {
      setError(
        "Percentage must be between 0 and 100."
      );
      return;
    }

    setSaving(true);

    /*
     * Check again before inserting.
     *
     * The learner list is already filtered on the
     * assessment detail page, but this second check
     * protects against duplicate submissions when
     * the page has not refreshed yet.
     */
    const {
      data: existingResult,
      error: existingResultError,
    } = await supabase
      .from("assessment_results")
      .select("id")
      .eq("assessment_id", assessmentId)
      .eq("learner_id", learnerId)
      .maybeSingle();

    if (existingResultError) {
      setError(existingResultError.message);
      setSaving(false);
      return;
    }

    if (existingResult) {
      setError(
        "This learner already has a result for this assessment."
      );
      setSaving(false);
      return;
    }

    const { error: insertError } =
      await supabase
        .from("assessment_results")
        .insert({
          assessment_id: assessmentId,
          learner_id: learnerId,
          score: numericScore,
          percentage: numericPercentage,
          feedback:
            feedback.trim() || null,
          strengths:
            strengths.trim() || null,
          areas_to_improve:
            areasToImprove.trim() || null,
        });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setLearnerId("");
setScore("");
setPercentage("");
setFeedback("");
setStrengths("");
setAreasToImprove("");

window.location.reload();
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-6 py-5">
        <h2 className="text-lg font-semibold">
          Record Assessment Result
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Record the result for a learner who does
          not yet have a result for this assessment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 px-6 py-6"
      >
        {learners.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              All available learners already have
              a result for this assessment.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="learner"
                  className="text-sm font-medium"
                >
                  Learner
                </label>

                <select
                  id="learner"
                  value={learnerId}
                  onChange={(event) =>
                    setLearnerId(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    Select learner
                  </option>

                  {learners.map((learner) => (
                    <option
                      key={learner.id}
                      value={learner.id}
                    >
                      {learner.full_name}
                      {learner.email
                        ? ` — ${learner.email}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="score"
                  className="text-sm font-medium"
                >
                  Score
                  {maxScore !== null
                    ? ` / ${maxScore}`
                    : ""}
                </label>

                <input
                  id="score"
                  type="number"
                  min="0"
                  max={
                    maxScore !== null
                      ? maxScore
                      : undefined
                  }
                  step="any"
                  value={score}
                  onChange={(event) =>
                    handleScoreChange(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  placeholder="e.g. 80"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="percentage"
                  className="text-sm font-medium"
                >
                  Percentage
                </label>

                <input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentage}
                  onChange={(event) =>
                    setPercentage(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  placeholder="e.g. 88.9"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <p className="text-xs text-muted-foreground">
                  Automatically calculated from
                  the score when a maximum score is
                  available.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="feedback"
                className="text-sm font-medium"
              >
                Feedback
              </label>

              <textarea
                id="feedback"
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                disabled={saving}
                rows={3}
                placeholder="Overall feedback for the learner..."
                className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="strengths"
                  className="text-sm font-medium"
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
                  disabled={saving}
                  rows={4}
                  placeholder="What did the learner do well?"
                  className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="areas-to-improve"
                  className="text-sm font-medium"
                >
                  Areas to Improve
                </label>

                <textarea
                  id="areas-to-improve"
                  value={areasToImprove}
                  onChange={(event) =>
                    setAreasToImprove(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows={4}
                  placeholder="What should the learner improve?"
                  className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Record Result"}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}