"use client";

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
};

type Lesson = {
  id: string;
  title: string;
};

type LessonActivity = {
  activity_id: string;
};

export default function AddActivityToLessonPage() {
  const params = useParams<{
    courseId: string;
    unitId: string;
    lessonId: string;
  }>();

  const router = useRouter();

  const courseId = params.courseId;
  const unitId = params.unitId;
  const lessonId = params.lessonId;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assignedActivityIds, setAssignedActivityIds] = useState<
    string[]
  >([]);

  const [selectedActivityId, setSelectedActivityId] =
    useState("");

  const [orderIndex, setOrderIndex] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      const supabase = createClient();

      const [
        { data: lessonData, error: lessonError },
        { data: activityData, error: activitiesError },
        { data: lessonActivityData, error: lessonActivitiesError },
      ] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, title")
          .eq("id", lessonId)
          .single(),

        supabase
          .from("activities")
          .select(
            "id, title, description, activity_type, level, skill, duration"
          )
          .order("title", {
            ascending: true,
          }),

        supabase
          .from("lesson_activities")
          .select("activity_id")
          .eq("lesson_id", lessonId),
      ]);

      if (lessonError) {
        console.error(
          "Failed to load lesson:",
          lessonError
        );

        setErrorMessage("Failed to load the lesson.");
        setLoading(false);
        return;
      }

      if (activitiesError) {
        console.error(
          "Failed to load activities:",
          activitiesError
        );

        setErrorMessage("Failed to load activities.");
        setLoading(false);
        return;
      }

      if (lessonActivitiesError) {
        console.error(
          "Failed to load assigned activities:",
          lessonActivitiesError
        );

        setErrorMessage(
          "Failed to load the lesson activities."
        );
        setLoading(false);
        return;
      }

      setLesson(lessonData as Lesson);
      setActivities((activityData ?? []) as Activity[]);

      const assigned =
        (lessonActivityData ?? []) as LessonActivity[];

      setAssignedActivityIds(
        assigned.map((item) => item.activity_id)
      );

      setLoading(false);
    }

    loadData();
  }, [lessonId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedActivityId) {
      setErrorMessage("Please select an activity.");
      return;
    }

    let parsedOrderIndex: number | null = null;

    if (orderIndex.trim() !== "") {
      const parsed = Number(orderIndex);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        setErrorMessage(
          "Order must be a positive whole number."
        );
        return;
      }

      parsedOrderIndex = parsed;
    }

    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data: existingAssignment, error: existingError } =
      await supabase
        .from("lesson_activities")
        .select("id")
        .eq("lesson_id", lessonId)
        .eq("activity_id", selectedActivityId)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Failed to check existing activity assignment:",
        existingError
      );

      setErrorMessage(
        "Failed to check whether this activity is already assigned."
      );

      setSaving(false);
      return;
    }

    if (existingAssignment) {
      setErrorMessage(
        "This activity is already assigned to this lesson."
      );

      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("lesson_activities")
      .insert({
        lesson_id: lessonId,
        activity_id: selectedActivityId,
        order_index: parsedOrderIndex,
        notes: notes.trim() || null,
      });

    if (insertError) {
      console.error(
        "Failed to add activity to lesson:",
        insertError
      );

      setErrorMessage(
        "Failed to add the activity to this lesson."
      );

      setSaving(false);
      return;
    }

    router.push(
      `/courses/${courseId}/units/${unitId}/lessons/${lessonId}`
    );
    router.refresh();
  }

  const availableActivities = activities.filter(
    (activity) =>
      !assignedActivityIds.includes(activity.id)
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-xl border border-[#e7e9ed] bg-white p-6">
            <p className="text-sm text-gray-500">
              Loading...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="rounded-xl border border-[#e7e9ed] bg-white p-6">
            <p className="text-sm text-gray-700">
              Lesson not found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <a
            href="/courses"
            className="hover:text-gray-900"
          >
            Courses
          </a>

          <span>›</span>

          <a
            href={`/courses/${courseId}`}
            className="hover:text-gray-900"
          >
            Course
          </a>

          <span>›</span>

          <span className="text-gray-900">
            Add Activity
          </span>
        </div>

        {/* Header */}
        <section className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Lesson
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            Add Activity
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add a reusable classroom activity to{" "}
            <span className="font-medium text-gray-700">
              {lesson.title}
            </span>
            .
          </p>
        </section>

        {/* Form */}
        <section className="rounded-xl border border-[#e7e9ed] bg-white">
          <div className="border-b border-[#e7e9ed] px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900">
              Activity Assignment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select an activity and optionally define its order
              and lesson-specific notes.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Activity */}
            <div>
              <label
                htmlFor="activity"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Activity *
              </label>

              <select
                id="activity"
                value={selectedActivityId}
                onChange={(event) =>
                  setSelectedActivityId(
                    event.target.value
                  )
                }
                disabled={
                  saving ||
                  availableActivities.length === 0
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="">
                  Select an activity
                </option>

                {availableActivities.map((activity) => (
                  <option
                    key={activity.id}
                    value={activity.id}
                  >
                    {activity.title}
                    {activity.activity_type
                      ? ` — ${activity.activity_type}`
                      : ""}
                    {activity.level
                      ? ` — ${activity.level}`
                      : ""}
                  </option>
                ))}
              </select>

              {availableActivities.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  All available activities are already
                  assigned to this lesson.
                </p>
              )}
            </div>

            {/* Order */}
            <div>
              <label
                htmlFor="orderIndex"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Order
              </label>

              <input
                id="orderIndex"
                type="number"
                min="1"
                step="1"
                value={orderIndex}
                onChange={(event) =>
                  setOrderIndex(event.target.value)
                }
                placeholder="e.g. 1"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <p className="mt-1 text-xs text-gray-500">
                Optional. Use 1, 2, 3... to define the activity
                sequence.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Notes
              </label>

              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Add lesson-specific notes for this activity..."
                disabled={saving}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/courses/${courseId}/units/${unitId}/lessons/${lessonId}`
                  )
                }
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  !selectedActivityId ||
                  availableActivities.length === 0
                }
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Adding..."
                  : "Add Activity"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}