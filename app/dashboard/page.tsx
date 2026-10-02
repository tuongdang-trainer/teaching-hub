import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type ClassItem = {
  id: string;
  name: string;
  status: string;
};

type Learner = {
  id: string;
  full_name: string;
  status: string;
};

type LessonItem = {
  id: string;
  course_id: string;
  unit_id: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  class_id: string | null;
  class:
    | {
        name: string;
      }[]
    | null;
};

type AttendanceSession = {
  id: string;
  date: string;
  status: string;
};

type AttendanceRecord = {
  session_id: string;
  status: string;
};

type Assessment = {
  id: string;
  name: string;
  type: string;
  class_id: string | null;
  date: string | null;
};

type AssessmentResult = {
  assessment_id: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAssessmentDate(value: string | null) {
  if (!value) return "No date";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const [
    classesResponse,
    learnersResponse,
    lessonsResponse,
    todayLessonsResponse,
    upcomingLessonsResponse,
    attendanceSessionsResponse,
    attendanceRecordsResponse,
    assessmentsResponse,
    assessmentResultsResponse,
  ] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, status")
      .eq("status", "active"),

    supabase
      .from("learners")
      .select("id, full_name, status")
      .eq("status", "active"),

    supabase
      .from("lessons")
      .select("id")
      .gte("scheduled_at", startOfMonth.toISOString())
      .lte("scheduled_at", endOfMonth.toISOString()),

    supabase
      .from("lessons")
      .select(
        `
          id,
          course_id,
          unit_id,
          title,
          status,
          scheduled_at,
          class:classes (
            name
          )
        `
      )
      .gte("scheduled_at", startOfToday.toISOString())
      .lte("scheduled_at", endOfToday.toISOString())
      .order("scheduled_at", { ascending: true }),

    supabase
      .from("lessons")
      .select(
        `
          id,
          course_id,
          unit_id,
          title,
          status,
          scheduled_at,
          class:classes (
            name
          )
        `
      )
      .gt("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),

    supabase
      .from("attendance_sessions")
      .select("id, date, status")
      .eq("status", "completed"),

    supabase
      .from("attendance_records")
      .select("session_id, status"),

    supabase
      .from("assessments")
      .select("id, name, type, class_id, date")
      .order("date", { ascending: false })
      .limit(5),

    supabase
      .from("assessment_results")
      .select("assessment_id"),
  ]);

  const activeClasses =
    (classesResponse.data as ClassItem[]) ?? [];

  const activeLearners =
    (learnersResponse.data as Learner[]) ?? [];

  const monthlyLessons =
    (lessonsResponse.data as { id: string }[]) ?? [];

  const todayLessons =
    (todayLessonsResponse.data as LessonItem[]) ?? [];

  const upcomingLessons =
    (upcomingLessonsResponse.data as LessonItem[]) ?? [];

  const attendanceSessions =
    (attendanceSessionsResponse.data as AttendanceSession[]) ?? [];

  const attendanceRecords =
    (attendanceRecordsResponse.data as AttendanceRecord[]) ?? [];

  const assessments =
    (assessmentsResponse.data as Assessment[]) ?? [];

  const assessmentResults =
    (assessmentResultsResponse.data as AssessmentResult[]) ?? [];

  const completedSessionIds = new Set(
    attendanceSessions.map((session) => session.id)
  );

  const completedAttendanceRecords =
    attendanceRecords.filter((record) =>
      completedSessionIds.has(record.session_id)
    );

  const attendanceRate =
    completedAttendanceRecords.length > 0
      ? (completedAttendanceRecords.filter(
          (record) =>
            record.status === "present" ||
            record.status === "late"
        ).length /
          completedAttendanceRecords.length) *
        100
      : 0;

  const resultCountByAssessment = new Map<string, number>();

  assessmentResults.forEach((result) => {
    const current =
      resultCountByAssessment.get(result.assessment_id) ?? 0;

    resultCountByAssessment.set(
      result.assessment_id,
      current + 1
    );
  });

  const classMap = new Map(
    activeClasses.map((classItem) => [
      classItem.id,
      classItem.name,
    ])
  );

  const greeting = getGreeting(now.getHours());

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-sm text-gray-500">
          {formatDate(now.toISOString())}
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {greeting}, Cat Tuong.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Your teaching workspace for planning, teaching,
          recording, reviewing, and improving.
        </p>
      </div>

      {/* KPI */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Active Classes"
          value={activeClasses.length}
          description="Currently active teaching groups"
        />

        <DashboardStat
          label="Active Learners"
          value={activeLearners.length}
          description="Learners currently active"
        />

        <DashboardStat
          label="Lessons This Month"
          value={monthlyLessons.length}
          description="Scheduled lessons this month"
        />

        <DashboardStat
          label="Attendance Rate"
          value={`${attendanceRate.toFixed(1)}%`}
          description={
            attendanceSessions.length > 0
              ? "Based on completed attendance records"
              : "No completed attendance sessions yet"
          }
        />
      </section>

      {/* Today + Quick Actions */}
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[#e7e9ed] bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Today
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your teaching schedule for today.
              </p>
            </div>

            <Link
              href="/calendar"
              className="text-sm font-medium text-gray-700 hover:text-gray-950"
            >
              View calendar →
            </Link>
          </div>

          <div className="mt-6">
            {todayLessons.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">
                    No lessons scheduled today
                  </div>

                  <div className="mt-1 text-xs text-gray-400">
                    Your scheduled lessons will appear here.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {todayLessons.map((lesson) => {
                  const className =
                    lesson.class?.[0]?.name ??
                    "No class assigned";

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${lesson.course_id}/units/${lesson.unit_id}/lessons/${lesson.id}`}
                      className="block rounded-lg border border-gray-100 px-4 py-4 transition hover:border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lesson.title}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {className}
                          </div>
                        </div>

                        <div className="text-sm font-medium text-gray-700">
                          {lesson.scheduled_at
                            ? formatTime(lesson.scheduled_at)
                            : "No time"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#e7e9ed] bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Start working from here.
          </p>

          <div className="mt-5 space-y-2">
            <QuickAction
              title="Create a lesson"
              description="Plan a new teaching session"
              href="/lessons/new"
            />

            <QuickAction
              title="Add a class"
              description="Create a teaching group"
              href="/classes/new"
            />

            <QuickAction
              title="Add a learner"
              description="Create a learner profile"
              href="/learners/new"
            />

            <QuickAction
              title="Create an assessment"
              description="Track learner progress"
              href="/assessments/new"
            />
          </div>
        </div>
      </section>

      {/* Upcoming + Recent Assessments */}
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-[#e7e9ed] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Upcoming
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your next scheduled lessons.
              </p>
            </div>

            <Link
              href="/calendar"
              className="text-sm font-medium text-gray-700 hover:text-gray-950"
            >
              Calendar →
            </Link>
          </div>

          <div className="mt-5">
            {upcomingLessons.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <div className="text-sm font-medium text-gray-700">
                  No upcoming lessons
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  Schedule a lesson to see it here.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingLessons.map((lesson) => {
                  const className =
                    lesson.class?.[0]?.name ??
                    "No class assigned";

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${lesson.course_id}/units/${lesson.unit_id}/lessons/${lesson.id}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {lesson.title}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {className}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs font-medium text-gray-700">
                          {lesson.scheduled_at
                            ? formatDate(lesson.scheduled_at)
                            : "No date"}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {lesson.scheduled_at
                            ? formatTime(lesson.scheduled_at)
                            : ""}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#e7e9ed] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent Assessments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest assessments and recorded results.
              </p>
            </div>

            <Link
              href="/assessments"
              className="text-sm font-medium text-gray-700 hover:text-gray-950"
            >
              View all →
            </Link>
          </div>

          <div className="mt-5">
            {assessments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <div className="text-sm font-medium text-gray-700">
                  No assessments yet
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  Create an assessment to start tracking progress.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {assessments.map((assessment) => {
                  const className = assessment.class_id
                    ? classMap.get(assessment.class_id) ??
                      "Unknown Class"
                    : "No class";

                  const resultCount =
                    resultCountByAssessment.get(
                      assessment.id
                    ) ?? 0;

                  return (
                    <Link
                      key={assessment.id}
                      href={`/assessments/${assessment.id}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">
                          {assessment.name}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {className} · {assessment.type}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs font-medium text-gray-700">
                          {formatAssessmentDate(
                            assessment.date
                          )}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {resultCount}{" "}
                          {resultCount === 1
                            ? "result"
                            : "results"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Teaching Loop */}
      <section className="mt-6 rounded-xl border border-[#e7e9ed] bg-white p-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Teaching Loop
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The workflow behind Teaching Hub.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {[
            "Plan",
            "Prepare",
            "Teach",
            "Record",
            "Review",
            "Improve",
            "Reuse",
            "Repeat",
          ].map((step, index) => (
            <div
              key={step}
              className="relative rounded-lg bg-gray-50 px-3 py-4 text-center"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="mt-1 text-sm font-medium text-gray-800">
                {step}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function DashboardStat({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e7e9ed] bg-white p-5">
      <div className="text-sm text-gray-500">{label}</div>

      <div className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        {description}
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-100 px-4 py-3 transition hover:border-gray-200 hover:bg-gray-50"
    >
      <div className="text-sm font-medium text-gray-800">
        {title}
      </div>

      <div className="mt-1 text-xs text-gray-400">
        {description}
      </div>
    </Link>
  );
}