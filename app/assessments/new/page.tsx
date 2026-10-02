"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ClassInfo = {
  id: string;
  name: string;
};

type CreateAssessmentFormProps = {
  classes: ClassInfo[];
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

export default function CreateAssessmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loadingClasses, setLoadingClasses] =
    useState(true);

  const [name, setName] = useState("");
  const [type, setType] = useState("Progress");
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [description, setDescription] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadClasses() {
    const { data, error: classesError } =
      await supabase
        .from("classes")
        .select("id, name")
        .eq("status", "active")
        .order("name", {
          ascending: true,
        });

    if (classesError) {
      setError(classesError.message);
      setLoadingClasses(false);
      return;
    }

    setClasses((data as ClassInfo[]) ?? []);
    setLoadingClasses(false);
  }

  useState(() => {
    void loadClasses();
  });

  async function handleCreate() {
    if (!name.trim()) {
      setError("Please enter an assessment name.");
      return;
    }

    if (!type) {
      setError("Please select an assessment type.");
      return;
    }

    if (
      maxScore.trim() &&
      Number.isNaN(Number(maxScore))
    ) {
      setError("Max score must be a valid number.");
      return;
    }

    setSaving(true);
    setError("");

    const { data, error: insertError } =
      await supabase
        .from("assessments")
        .insert({
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
        .select("id")
        .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (!data?.id) {
      setError(
        "Assessment was created, but no assessment ID was returned."
      );
      setSaving(false);
      return;
    }

    router.push(
      `/assessments/${data.id}`
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            router.push("/assessments")
          }
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Assessments
        </button>

        <h1 className="text-2xl font-semibold tracking-tight">
          Create Assessment
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create an assessment to track learner performance.
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
              placeholder="e.g. Week 4 Progress Check"
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
                disabled={
                  saving || loadingClasses
                }
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

              {loadingClasses && (
                <p className="text-xs text-muted-foreground">
                  Loading classes...
                </p>
              )}
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
              placeholder="e.g. 100"
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
              placeholder="Add assessment instructions, purpose, or notes..."
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
              router.push("/assessments")
            }
            disabled={saving}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Creating..."
              : "Create Assessment"}
          </button>
        </div>
      </div>
    </main>
  );
}