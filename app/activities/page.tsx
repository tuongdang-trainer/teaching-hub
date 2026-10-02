import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

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
};

export default async function ActivitiesPage() {
  const supabase = await createClient();

  const { data: activities, error } = await supabase
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
        created_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load activities:", error);
  }

  const activityList = (activities ?? []) as Activity[];

  const totalActivities = activityList.length;

  const activityTypeCount = new Set(
    activityList
      .map((activity) => activity.activity_type)
      .filter(Boolean)
  ).size;

  const levelCount = new Set(
    activityList
      .map((activity) => activity.level)
      .filter(Boolean)
  ).size;

  const skillCount = new Set(
    activityList
      .map((activity) => activity.skill)
      .filter(Boolean)
  ).size;

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Activity Library
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Build, organize, and reuse classroom activities.
          </p>
        </div>

        <Link
          href="/activities/new"
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
        >
          + Create Activity
        </Link>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Total Activities
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalActivities}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Activity Types
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {activityTypeCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Levels
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {levelCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Skills
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {skillCount}
          </p>
        </div>
      </section>

      {/* Activities */}
      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            Failed to load activities.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Please check the Supabase connection and database
            permissions.
          </p>
        </section>
      ) : activityList.length === 0 ? (
        <section className="rounded-xl border border-dashed bg-white p-12 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-4xl">🎯</div>

            <h3 className="mt-4 text-lg font-semibold">
              No activities yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Start building your activity library by creating
              your first classroom activity.
            </p>

            <Link
              href="/activities/new"
              className="mt-6 inline-flex rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Create your first activity
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">
              Activities
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Reusable classroom activities in your library.
            </p>
          </div>

          <div className="divide-y">
            {activityList.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="block px-6 py-5 transition hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <h3 className="font-medium">
                      {activity.title}
                    </h3>

                    {activity.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {activity.activity_type && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {activity.activity_type}
                        </span>
                      )}

                      {activity.level && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {activity.level}
                        </span>
                      )}

                      {activity.skill && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {activity.skill}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {activity.duration !== null ? (
                      <p className="text-sm font-medium">
                        {activity.duration} min
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No duration
                      </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                      View →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}