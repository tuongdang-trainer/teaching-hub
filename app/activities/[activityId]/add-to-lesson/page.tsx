"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  title: string;
};

type Lesson = {
  id: string;
  title: string;
  course_id: string;
  unit_id: string;
};

type LessonActivity = {
  lesson_id: string;
};

export default function AddActivityToLessonPage() {
  const params = useParams<{ activityId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const activityId = params.activityId;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [existingLessonIds, setExistingLessonIds] = useState<string[]>([]);

  const [lessonId, setLessonId] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [
        activityResponse,
        lessonsResponse,
        existingResponse,
      ] = await Promise.all([
        supabase
          .from("activities")
          .select("id, title")
          .eq("id", activityId)
          .single(),

        supabase
          .from("lessons")
          .select("id, title, course_id, unit_id")
          .order("title", { ascending: true }),

        supabase
          .from("lesson_activities")
          .select("lesson_id")
          .eq("activity_id", activityId),
      ]);

      if (activityResponse.error) {
        setError(activityResponse.error.message);
        setLoading(false);
        return;
      }

      if (lessonsResponse.error) {
        setError(lessonsResponse.error.message);
        setLoading(false);
        return;
      }

      if (existingResponse.error) {
        setError(existingResponse.error.message);
        setLoading(false);
        return;
      }

      setActivity(activityResponse.data);
      setLessons(lessonsResponse.data ?? []);

      const existing =
        (existingResponse.data as LessonActivity[] | null)?.map(
          (item) => item.lesson_id,
        ) ?? [];

      setExistingLessonIds(existing);
      setLoading(false);
    }

    loadData();
  }, [activityId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!lessonId) {
      setError("Please select a lesson.");
      return;
    }

    if (existingLessonIds.includes(lessonId)) {
      setError("This activity is already added to the selected lesson.");
      return;
    }

    let parsedOrderIndex: number | null = null;

    if (orderIndex.trim()) {
      const parsed = Number(orderIndex);

      if (!Number.isInteger(parsed) || parsed < 1) {
        setError("Order must be a positive whole number.");
        return;
      }

      parsedOrderIndex = parsed;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("lesson_activities")
      .insert({
        lesson_id: lessonId,
        activity_id: activityId,
        order_index: parsedOrderIndex,
        notes: notes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    /*
     * Add succeeded.
     * Return to Activity Detail so the Used in Lessons section
     * immediately reflects the new association.
     */
    router.push(`/activities/${activityId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-900">
              Activity not found
            </h1>

            <p className="mt-2 text-sm text-red-700">
              The activity could not be loaded.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back
          </button>

          <p className="text-sm font-medium text-blue-600">
            Activity Library
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-slate-900">
            Add Activity to Lesson
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Reuse this activity in an existing lesson.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Activity
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-900">
              {activity.title}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {lessons.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-medium text-amber-900">
                No lessons available.
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Create a lesson first before adding this activity.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="lesson"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Lesson *
                </label>

                <select
                  id="lesson"
                  value={lessonId}
                  onChange={(event) => setLessonId(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a lesson</option>

                  {lessons.map((lesson) => {
                    const alreadyAdded = existingLessonIds.includes(
                      lesson.id,
                    );

                    return (
                      <option
                        key={lesson.id}
                        value={lesson.id}
                        disabled={alreadyAdded}
                      >
                        {lesson.title}
                        {alreadyAdded ? " — Already added" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor="orderIndex"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Order
                </label>

                <input
                  id="orderIndex"
                  type="number"
                  min="1"
                  step="1"
                  value={orderIndex}
                  onChange={(event) => setOrderIndex(event.target.value)}
                  placeholder="e.g. 1"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Optional. Use this to control the activity sequence in the
                  lesson.
                </p>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Optional notes for this lesson..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl border border-[#dfe3e8] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add to Lesson"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}