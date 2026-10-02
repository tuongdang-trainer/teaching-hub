"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  activity_type: string | null;
  level: string | null;
  skill: string | null;
  duration: number | null;
  instructions: string | null;
  teacher_notes: string | null;
  learner_instructions: string | null;
};

export default function EditActivityPage() {
  const params = useParams();
  const router = useRouter();

  const activityId = params.activityId as string;

  const [activity, setActivity] = useState<Activity | null>(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("activities")
        .select(
          `
            id,
            title,
            description,
            activity_type,
            level,
            skill,
            duration,
            instructions,
            teacher_notes,
            learner_instructions
          `
        )
        .eq("id", activityId)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "Failed to load activity:",
          fetchError
        );

        setError("Failed to load activity.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Activity not found.");
        setLoading(false);
        return;
      }

      const activityData = data as Activity;

      setActivity(activityData);
      setTitle(activityData.title);
      setDescription(activityData.description ?? "");
      setActivityType(activityData.activity_type ?? "");
      setLevel(activityData.level ?? "");
      setSkill(activityData.skill ?? "");
      setDuration(
        activityData.duration !== null
          ? String(activityData.duration)
          : ""
      );
      setInstructions(activityData.instructions ?? "");
      setTeacherNotes(activityData.teacher_notes ?? "");
      setLearnerInstructions(
        activityData.learner_instructions ?? ""
      );

      setLoading(false);
    }

    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Activity title is required.");
      return;
    }

    const parsedDuration = duration
      ? Number.parseInt(duration, 10)
      : null;

    if (
      parsedDuration !== null &&
      (!Number.isInteger(parsedDuration) ||
        parsedDuration <= 0)
    ) {
      setError("Duration must be a positive number.");
      return;
    }

    setSaving(true);
    setError("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("activities")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", activityId);

    if (updateError) {
      console.error(
        "Failed to update activity:",
        updateError
      );

      setError(
        updateError.message || "Failed to update activity."
      );

      setSaving(false);
      return;
    }

    router.push(`/activities/${activityId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="space-y-8 p-8">
        <div>
          <Link
            href="/activities"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Back to Activities
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Edit Activity
          </h1>
        </div>

        <section className="rounded-xl border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            Loading activity...
          </p>
        </section>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="space-y-8 p-8">
        <div>
          <Link
            href="/activities"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            ← Back to Activities
          </Link>
        </div>

        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            Activity not found.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div>
        <Link
          href={`/activities/${activityId}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Activity
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Edit Activity
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the activity details and teaching instructions.
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
              Update the activity and its classification.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Activity Title{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
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
                  onChange={(event) =>
                    setLevel(event.target.value)
                  }
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
                  onChange={(event) =>
                    setSkill(event.target.value)
                  }
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
              Update the information needed to run the activity.
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
                  setLearnerInstructions(
                    event.target.value
                  )
                }
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
            href={`/activities/${activityId}`}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}