"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Assessment = {
  id: string;
  name: string;
  type: string;
  class_id: string | null;
  date: string | null;
  max_score: number | null;
  description: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
};

const ASSESSMENT_TYPES = [
  "Placement",
  "Quiz",
  "Midterm",
  "Final",
  "Progress",
  "Speaking",
  "Writing",
  "Other",
];

export default function EditAssessmentPage() {
  const router = useRouter();
  const params = useParams();

  const assessmentId = params.assessmentId as string;

  const supabase = createClient();

  const [assessment, setAssessment] =
    useState<Assessment | null>(null);

  const [classes, setClasses] =
    useState<ClassInfo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [name, setName] =
    useState("");

  const [type, setType] =
    useState("Progress");

  const [classId, setClassId] =
    useState("");

  const [date, setDate] =
    useState("");

  const [maxScore, setMaxScore] =
    useState("");

  const [description, setDescription] =
    useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [
        assessmentResponse,
        classesResponse,
      ] = await Promise.all([
        supabase
          .from("assessments")
          .select(
            "id, name, type, class_id, date, max_score, description"
          )
          .eq("id", assessmentId)
          .single(),

        supabase
          .from("classes")
          .select("id, name")
          .eq("status", "active")
          .order("name", {
            ascending: true,
          }),
      ]);

      if (assessmentResponse.error) {
        setError(
          assessmentResponse.error.message
        );
        setLoading(false);
        return;
      }

      if (classesResponse.error) {
        setError(
          classesResponse.error.message
        );
        setLoading(false);
        return;
      }

      const assessmentData =
        assessmentResponse.data as Assessment;

      setAssessment(assessmentData);

      setClasses(
        (classesResponse.data as ClassInfo[]) ??
          []
      );

      setName(assessmentData.name);
      setType(assessmentData.type);
      setClassId(
        assessmentData.class_id ?? ""
      );
      setDate(
        assessmentData.date ?? ""
      );
      setMaxScore(
        assessmentData.max_score !== null
          ? String(assessmentData.max_score)
          : ""
      );
      setDescription(
        assessmentData.description ?? ""
      );

      setLoading(false);
    }

    void loadData();
  }, [assessmentId]);

  async function handleSave() {
    if (!name.trim()) {
      setError(
        "Please enter an assessment name."
      );
      return;
    }

    if (!type) {
      setError(
        "Please select an assessment type."
      );
      return;
    }

    if (
      maxScore.trim() &&
      Number.isNaN(Number(maxScore))
    ) {
      setError(
        "Max score must be a valid number."
      );
      return;
    }

    if (
      maxScore.trim() &&
      Number(maxScore) < 0
    ) {
      setError(
        "Max score cannot be negative."
      );
      return;
    }

    setSaving(true);
    setError("");

    const { error: updateError } =
      await supabase
        .from("assessments")
        .update({
          name: name.trim(),
          type,
          class_id: classId || null,
          date: date || null,
          max_score: maxScore.trim()
            ? Number(maxScore)
            : null,
          description:
            description.trim() || null,
        })
        .eq("id", assessmentId);

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
      <main className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading assessment...
          </p>
        </div>
      </main>
    );
  }

  if (!assessment) {
    return (
      <main className="mx-auto max-w-3xl">
        <div className="rounded-2xl border bg-card px-6 py-12 text-center">
          <h1 className="font-semibold">
            Assessment not found
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            The assessment could not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/assessments")
            }
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Back to Assessments
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/assessments/${assessmentId}`
            )
          }
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessment
        </button>

        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Assessment
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the assessment details and settings.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="assessment-name"
              className="text-sm font-medium"
            >
              Assessment Name
            </label>

            <input
              id="assessment-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              disabled={saving}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label
              htmlFor="assessment-type"
              className="text-sm font-medium"
            >
              Assessment Type
            </label>

            <select
              id="assessment-type"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setError("");
              }}
              disabled={saving}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ASSESSMENT_TYPES.map(
                (assessmentType) => (
                  <option
                    key={assessmentType}
                    value={assessmentType}
                  >
                    {assessmentType}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Class + Date */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="assessment-class"
                className="text-sm font-medium"
              >
                Class
              </label>

              <select
                id="assessment-class"
                value={classId}
                onChange={(event) => {
                  setClassId(
                    event.target.value
                  );
                  setError("");
                }}
                disabled={saving}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  No Class / General
                </option>

                {classes.map((classItem) => (
                  <option
                    key={classItem.id}
                    value={classItem.id}
                  >
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="assessment-date"
                className="text-sm font-medium"
              >
                Assessment Date
              </label>

              <input
                id="assessment-date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError("");
                }}
                disabled={saving}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Max Score */}
          <div className="space-y-2">
            <label
              htmlFor="assessment-max-score"
              className="text-sm font-medium"
            >
              Max Score
            </label>

            <input
              id="assessment-max-score"
              type="number"
              min="0"
              step="0.01"
              value={maxScore}
              onChange={(event) => {
                setMaxScore(
                  event.target.value
                );
                setError("");
              }}
              disabled={saving}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="assessment-description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="assessment-description"
              value={description}
              onChange={(event) => {
                setDescription(
                  event.target.value
                );
                setError("");
              }}
              rows={4}
              disabled={saving}
              className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
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
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}