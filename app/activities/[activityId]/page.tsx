import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import RemoveFromLessonButton from "@/components/activities/remove-from-lesson-button";

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
  created_at: string;
  updated_at: string;
};

type Lesson = {
  id: string;
  title: string;
  course_id: string | null;
  unit_id: string | null;
};

type LessonActivity = {
  lesson_id: string;
  order_index: number | null;
  notes: string | null;
};

type ActivityDetailPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const { activityId } = await params;

  const supabase = await createClient();

  const { data: activity, error } = await supabase
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
        learner_instructions,
        created_at,
        updated_at
      `
    )
    .eq("id", activityId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load activity:", error);
  }

  if (!activity) {
    notFound();
  }

  const activityData = activity as Activity;

  /*
   * Load lessons where this activity has been added.
   */
  const { data: lessonActivities, error: lessonActivitiesError } =
    await supabase
      .from("lesson_activities")
      .select("lesson_id, order_index, notes")
      .eq("activity_id", activityId)
      .order("order_index", {
        ascending: true,
        nullsFirst: false,
      });

  if (lessonActivitiesError) {
    console.error(
      "Failed to load activity lessons:",
      lessonActivitiesError
    );
  }

  const associations =
    (lessonActivities as LessonActivity[] | null) ?? [];

  const lessonIds = associations.map(
    (association) => association.lesson_id
  );

  let lessons: Lesson[] = [];

  if (lessonIds.length > 0) {
    const { data: lessonData, error: lessonsError } =
      await supabase
        .from("lessons")
        .select("id, title, course_id, unit_id")
        .in("id", lessonIds);

    if (lessonsError) {
      console.error(
        "Failed to load lessons:",
        lessonsError
      );
    }

    lessons = (lessonData as Lesson[] | null) ?? [];
  }

  const lessonMap = new Map(
    lessons.map((lesson) => [lesson.id, lesson])
  );

  const usedInLessons = associations
    .map((association) => ({
      ...association,
      lesson: lessonMap.get(association.lesson_id) ?? null,
    }))
    .filter(
      (
        item
      ): item is LessonActivity & {
        lesson: Lesson;
      } => Boolean(item.lesson)
    );

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

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {activityData.activity_type && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {activityData.activity_type}
                </span>
              )}

              {activityData.level && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {activityData.level}
                </span>
              )}

              {activityData.skill && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {activityData.skill}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {activityData.title}
            </h1>

            {activityData.description && (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {activityData.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href={`/activities/${activityData.id}/edit`}
              className="inline-flex items-center rounded-lg border border-[#dfe3e8] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8fafc]"
            >
              Edit
            </Link>

            <Link
              href={`/activities/${activityData.id}/add-to-lesson`}
              className="inline-flex items-center rounded-lg border border-[#dfe3e8] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8fafc]"
            >
              Add to Lesson
            </Link>

            <Link
              href={`/activities/${activityData.id}/delete`}
              className="inline-flex items-center rounded-lg border border-[#f0d4d4] bg-white px-4 py-2.5 text-sm font-medium text-[#b42318] transition hover:bg-[#fff5f5]"
            >
              Delete
            </Link>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Activity Type
          </p>

          <p className="mt-2 font-medium">
            {activityData.activity_type || "Not specified"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Level
          </p>

          <p className="mt-2 font-medium">
            {activityData.level || "Not specified"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Duration
          </p>

          <p className="mt-2 font-medium">
            {activityData.duration !== null
              ? `${activityData.duration} minutes`
              : "Not specified"}
          </p>
        </div>
      </section>

      {/* Used in Lessons */}
      <section className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Used in Lessons
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Lessons where this activity has been added.
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {usedInLessons.length}{" "}
            {usedInLessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>

        {usedInLessons.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              Not used in any lessons yet.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add this activity to a lesson to start reusing it.
            </p>

            <Link
              href={`/activities/${activityData.id}/add-to-lesson`}
              className="mt-4 inline-flex items-center rounded-lg border border-[#dfe3e8] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8fafc]"
            >
              Add to Lesson
            </Link>
          </div>
        ) : (
          <div className="mt-5 divide-y rounded-xl border">
            {usedInLessons.map((item) => (
              <div
                key={item.lesson_id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/courses/${item.lesson.course_id}/units/${item.lesson.unit_id}/lessons/${item.lesson.id}`}
                    className="font-medium text-slate-900 transition hover:text-blue-600"
                  >
                    {item.lesson.title}
                  </Link>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {item.order_index !== null && (
                      <span>
                        Order {item.order_index}
                      </span>
                    )}

                    {item.notes && (
                      <span>
                        {item.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/courses/${item.lesson.course_id}/units/${item.lesson.unit_id}/lessons/${item.lesson.id}`}
                    className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    View Lesson →
                  </Link>

                  <RemoveFromLessonButton
                    activityId={activityData.id}
                    lessonId={item.lesson_id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Instructions */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Instructions
          </h2>

          {activityData.instructions ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {activityData.instructions}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No instructions provided.
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Learner Instructions
          </h2>

          {activityData.learner_instructions ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {activityData.learner_instructions}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No learner instructions provided.
            </p>
          )}
        </div>
      </section>

      {/* Teacher Notes */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Teacher Notes
        </h2>

        {activityData.teacher_notes ? (
          <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {activityData.teacher_notes}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No teacher notes provided.
          </p>
        )}
      </section>

      {/* Metadata */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Activity Information
        </h2>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">
              Created
            </p>

            <p className="mt-1 font-medium">
              {new Date(
                activityData.created_at
              ).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">
              Last Updated
            </p>

            <p className="mt-1 font-medium">
              {new Date(
                activityData.updated_at
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}