"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  title: string;
};

export default function DeleteActivityPage() {
  const params = useParams();
  const router = useRouter();

  const activityId = params.activityId as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [lessonCount, setLessonCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivity() {
      const supabase = createClient();

      const { data, error: activityError } = await supabase
        .from("activities")
        .select("id, title")
        .eq("id", activityId)
        .maybeSingle();

      if (activityError) {
        console.error(
          "Failed to load activity:",
          activityError
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

      setActivity(data as Activity);

      const {
        count,
        error: relationError,
      } = await supabase
        .from("lesson_activities")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("activity_id", activityId);

      if (relationError) {
        console.error(
          "Failed to check lesson relationships:",
          relationError
        );

        setError(
          "Failed to check whether this activity is used in lessons."
        );
        setLoading(false);
        return;
      }

      setLessonCount(count ?? 0);
      setLoading(false);
    }

    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  async function handleDelete() {
    if (!activity) {
      return;
    }

    setDeleting(true);
    setError("");

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (deleteError) {
      console.error(
        "Failed to delete activity:",
        deleteError
      );

      setError(
        deleteError.message || "Failed to delete activity."
      );

      setDeleting(false);
      return;
    }

    window.location.href = "/activities";
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
            Delete Activity
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
            {error || "Activity not found."}
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

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Delete Activity
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Permanently remove this activity from your teaching
          library.
        </p>
      </div>

      {/* Confirmation */}
      <section className="max-w-2xl rounded-xl border border-red-200 bg-white p-6">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="font-medium text-red-800">
            Are you sure you want to delete this activity?
          </p>

          <p className="mt-2 text-sm text-red-700">
            This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Activity
          </p>

          <p className="mt-1 font-semibold">
            {activity.title}
          </p>
        </div>

        {lessonCount > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-medium text-amber-800">
              This activity is currently used in{" "}
              {lessonCount}{" "}
              {lessonCount === 1 ? "lesson" : "lessons"}.
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Deleting the activity will also remove its
              lesson associations.
            </p>
          </div>
        )}

        {lessonCount === 0 && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              This activity is not currently associated with
              any lessons.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href={`/activities/${activityId}`}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Activity"}
          </button>
        </div>
      </section>
    </main>
  );
}