"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function CreateActivityPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("");
  const [level, setLevel] = useState("");
  const [skill, setSkill] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [learnerInstructions, setLearnerInstructions] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Activity title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create an activity.");
      setSaving(false);
      return;
    }

    const parsedDuration = duration
      ? Number.parseInt(duration, 10)
      : null;

    if (
      parsedDuration !== null &&
      (!Number.isInteger(parsedDuration) || parsedDuration <= 0)
    ) {
      setError("Duration must be a positive number.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("activities")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        activity_type: activityType.trim() || null,
        level: level.trim() || null,
        skill: skill.trim() || null,
        duration: parsedDuration,
        instructions: instructions.trim() || null,
        teacher_notes: teacherNotes.trim() || null,
        learner_instructions:
          learnerInstructions.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to create activity:", insertError);
      setError(
        insertError.message || "Failed to create activity."
      );
      setSaving(false);
      return;
    }

    if (!data?.id) {
      setError("Activity was created but no activity ID was returned.");
      setSaving(false);
      return;
    }

    window.location.href = `/activities/${data.id}`;
  }

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div>
        <Link
          href="/activities"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Activities
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create Activity
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a reusable classroom activity for your teaching
            library.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-8"
      >
        {/* Basic Information */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Define the activity and how it should be categorized.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Activity Title <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Find Someone Who"
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Briefly describe the activity and its purpose."
                rows={3}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="activityType"
                  className="mb-2 block text-sm font-medium"
                >
                  Activity Type
                </label>

                <input
                  id="activityType"
                  type="text"
                  value={activityType}
                  onChange={(event) =>
                    setActivityType(event.target.value)
                  }
                  placeholder="e.g. Pair Work"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="mb-2 block text-sm font-medium"
                >
                  Level
                </label>

                <input
                  id="level"
                  type="text"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  placeholder="e.g. Level 1"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="skill"
                  className="mb-2 block text-sm font-medium"
                >
                  Skill
                </label>

                <input
                  id="skill"
                  type="text"
                  value={skill}
                  onChange={(event) => setSkill(event.target.value)}
                  placeholder="e.g. Speaking"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
                />
              </div>
            </div>

            <div className="max-w-xs">
              <label
                htmlFor="duration"
                className="mb-2 block text-sm font-medium"
              >
                Duration
              </label>

              <div className="relative">
                <input
                  id="duration"
                  type="number"
                  min="1"
                  step="1"
                  value={duration}
                  onChange={(event) =>
                    setDuration(event.target.value)
                  }
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border px-3 py-2.5 pr-16 text-sm outline-none transition focus:border-black"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  minutes
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Activity Instructions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add the information needed to run the activity in
              class.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="instructions"
                className="mb-2 block text-sm font-medium"
              >
                Instructions
              </label>

              <textarea
                id="instructions"
                value={instructions}
                onChange={(event) =>
                  setInstructions(event.target.value)
                }
                placeholder="Describe the activity flow and steps."
                rows={6}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="learnerInstructions"
                className="mb-2 block text-sm font-medium"
              >
                Learner Instructions
              </label>

              <textarea
                id="learnerInstructions"
                value={learnerInstructions}
                onChange={(event) =>
                  setLearnerInstructions(event.target.value)
                }
                placeholder="What should learners do during the activity?"
                rows={5}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="teacherNotes"
                className="mb-2 block text-sm font-medium"
              >
                Teacher Notes
              </label>

              <textarea
                id="teacherNotes"
                value={teacherNotes}
                onChange={(event) =>
                  setTeacherNotes(event.target.value)
                }
                placeholder="Add facilitation tips, timing notes, variations, or things to watch for."
                rows={5}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/activities"
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Activity"}
          </button>
        </div>
      </form>
    </main>
  );
}