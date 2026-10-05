import { createClient } from "@/lib/supabase/server";

type ClassRow = {
  id: string;
  name: string;
};

type LessonRow = {
  id: string;
  scheduled_at: string | null;
  class_id: string | null;
  class: {
    id: string;
    name: string;
  }[] | null;
};

type LearnerRow = {
  id: string;
  full_name: string;
};

type AttendanceRecord = {
  learner_id: string;
  status: string;
  session: {
    date: string;
    class_id: string;
  }[] | null;
};

type AssessmentResult = {
  learner_id: string;
  percentage: number | null;
  assessment: {
    class_id: string | null;
    date: string | null;
  }[] | null;
};

type LearnerAnalytics = {
  id: string;
  name: string;
  attendanceRate: number;
  assessmentAverage: number | null;
  attendanceTotal: number;
  assessmentCount: number;
  needsAttention: boolean;
  reasons: string[];
};

type PerformanceLearner = {
  id: string;
  name: string;
  average: number;
  resultCount: number;
};

type DateRangeOption =
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "this-year";

function getDateRange(option: DateRangeOption) {
  const now = new Date();

  if (option === "last-month") {
    return {
      start: new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      ),
      end: new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    };
  }

  if (option === "last-3-months") {
    return {
      start: new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1,
      ),
      end: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      ),
    };
  }

  if (option === "this-year") {
    return {
      start: new Date(
        now.getFullYear(),
        0,
        1,
      ),
      end: new Date(
        now.getFullYear() + 1,
        0,
        1,
      ),
    };
  }

  return {
    start: new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ),
    end: new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    ),
  };
}

function getDateRangeLabel(
  option: DateRangeOption,
) {
  if (option === "last-month") {
    return "Last Month";
  }

  if (option === "last-3-months") {
    return "Last 3 Months";
  }

  if (option === "this-year") {
    return "This Year";
  }

  return "This Month";
}

function getDateRangeDescription(
  option: DateRangeOption,
  start: Date,
  end: Date,
) {
  if (option === "this-year") {
    return start.toLocaleDateString("en-US", {
      year: "numeric",
    });
  }

  const endDisplay = new Date(end);
  endDisplay.setDate(endDisplay.getDate() - 1);

  if (
    start.getMonth() === endDisplay.getMonth() &&
    start.getFullYear() ===
      endDisplay.getFullYear()
  ) {
    return start.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} – ${endDisplay.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  )}`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    class?: string;
    range?: string;
  }>;
}) {
  const supabase = await createClient();

  const params = await searchParams;

  const selectedClassId =
    params.class ?? "all";

  const rawRange = params.range;

  const selectedRange: DateRangeOption =
    rawRange === "last-month" ||
    rawRange === "last-3-months" ||
    rawRange === "this-year"
      ? rawRange
      : "this-month";

  const {
    start: startDate,
    end: endDate,
  } = getDateRange(selectedRange);

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  /*
   * Classes
   */

  const {
    data: classes,
    error: classesError,
  } = await supabase
    .from("classes")
    .select("id, name")
    .order("name", {
      ascending: true,
    });

  /*
   * Lessons
   */

  let lessonsQuery = supabase
    .from("lessons")
    .select(`
      id,
      scheduled_at,
      class_id,
      class:classes (
        id,
        name
      )
    `)
    .gte(
      "scheduled_at",
      startIso,
    )
    .lt(
      "scheduled_at",
      endIso,
    );

  if (selectedClassId !== "all") {
    lessonsQuery = lessonsQuery.eq(
      "class_id",
      selectedClassId,
    );
  }

  /*
   * Learners
   */

  const {
    data: learners,
    error: learnersError,
  } = await supabase
    .from("learners")
    .select("id, full_name")
    .eq("status", "active");

  /*
   * Attendance
   */

  const {
    data: attendanceRecords,
    error: attendanceError,
  } = await supabase
    .from("attendance_records")
    .select(`
      learner_id,
      status,
      session:attendance_sessions (
        date,
        class_id
      )
    `);

  /*
   * Assessment Results
   */

  const {
    data: assessmentResults,
    error: assessmentsError,
  } = await supabase
    .from("assessment_results")
    .select(`
      learner_id,
      percentage,
      assessment:assessments (
        class_id,
        date
      )
    `);

  const {
    data: lessons,
    error: lessonsError,
  } = await lessonsQuery;

  const firstError =
    classesError ||
    lessonsError ||
    learnersError ||
    attendanceError ||
    assessmentsError;

  if (firstError) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Teaching Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review teaching activity, learner engagement,
            and learning performance.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Unable to load analytics:{" "}
            {firstError.message}
          </p>
        </div>
      </main>
    );
  }

  const classList =
    (classes ?? []) as ClassRow[];

  const lessonList =
    (lessons ?? []) as LessonRow[];

  const learnerList =
    (learners ?? []) as LearnerRow[];

  const allAttendanceRecords =
    (attendanceRecords ?? []) as AttendanceRecord[];

  const allAssessmentResults =
    (assessmentResults ?? []) as AssessmentResult[];

  /*
   * Filter attendance by date + class.
   */

  const attendanceList =
    allAttendanceRecords.filter(
      (record) => {
        const session =
          record.session?.[0];

        if (!session) {
          return false;
        }

        const sessionDate =
          new Date(session.date);

        const inDateRange =
          sessionDate >= startDate &&
          sessionDate < endDate;

        const inClass =
          selectedClassId === "all" ||
          session.class_id ===
            selectedClassId;

        return inDateRange && inClass;
      },
    );

  /*
   * Filter assessment results by date + class.
   */

  const validAssessmentResults =
    allAssessmentResults.filter(
      (result) => {
        if (
          result.percentage === null
        ) {
          return false;
        }

        const assessment =
          result.assessment?.[0];

        if (!assessment) {
          return false;
        }

        if (!assessment.date) {
          return false;
        }

        const assessmentDate =
          new Date(assessment.date);

        const inDateRange =
          assessmentDate >= startDate &&
          assessmentDate < endDate;

        const inClass =
          selectedClassId === "all" ||
          assessment.class_id ===
            selectedClassId;

        return (
          inDateRange && inClass
        );
      },
    );

  /*
   * Active learners
   */

  let filteredLearnerList =
    learnerList;

  if (selectedClassId !== "all") {
    const {
      data: enrollments,
      error: enrollmentsError,
    } = await supabase
      .from("class_enrollments")
      .select("learner_id")
      .eq(
        "class_id",
        selectedClassId,
      )
      .eq("status", "active");

    if (enrollmentsError) {
      return (
        <main className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Teaching Analytics
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review teaching activity, learner engagement,
              and learning performance.
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Unable to load learner data:{" "}
              {enrollmentsError.message}
            </p>
          </div>
        </main>
      );
    }

    const enrolledLearnerIds =
      new Set(
        (enrollments ?? []).map(
          (enrollment) =>
            enrollment.learner_id,
        ),
      );

    filteredLearnerList =
      learnerList.filter((learner) =>
        enrolledLearnerIds.has(
          learner.id,
        ),
      );
  }

  /*
   * Overall attendance
   */

  const attendancePresent =
    attendanceList.filter(
      (record) =>
        record.status === "present",
    ).length;

  const attendanceLate =
    attendanceList.filter(
      (record) =>
        record.status === "late",
    ).length;

  const attendanceAbsent =
    attendanceList.filter(
      (record) =>
        record.status === "absent",
    ).length;

  const attendanceExcused =
    attendanceList.filter(
      (record) =>
        record.status === "excused",
    ).length;

  const attendanceTotal =
    attendanceList.length;

  const attendanceCount =
    attendancePresent +
    attendanceLate;

  const attendanceRate =
    attendanceTotal > 0
      ? (attendanceCount /
          attendanceTotal) *
        100
      : 0;

  /*
   * Assessment performance
   */

  const assessmentValues =
    validAssessmentResults.map(
      (result) =>
        Number(result.percentage),
    );

  const assessmentAverage =
    assessmentValues.length > 0
      ? assessmentValues.reduce(
          (total, value) =>
            total + value,
          0,
        ) / assessmentValues.length
      : 0;

  const assessmentHighest =
    assessmentValues.length > 0
      ? Math.max(...assessmentValues)
      : 0;

  const assessmentLowest =
    assessmentValues.length > 0
      ? Math.min(...assessmentValues)
      : 0;

  /*
   * Performance distribution
   */

  const lowPerformanceCount =
    assessmentValues.filter(
      (value) => value < 60,
    ).length;

  const mediumPerformanceCount =
    assessmentValues.filter(
      (value) =>
        value >= 60 &&
        value < 80,
    ).length;

  const highPerformanceCount =
    assessmentValues.filter(
      (value) => value >= 80,
    ).length;

  /*
   * Learner analytics
   */

  const learnerAnalytics: LearnerAnalytics[] =
    filteredLearnerList.map(
      (learner) => {
        const learnerAttendance =
          attendanceList.filter(
            (record) =>
              record.learner_id ===
              learner.id,
          );

        const learnerAttendanceTotal =
          learnerAttendance.length;

        const learnerAttendanceCount =
          learnerAttendance.filter(
            (record) =>
              record.status ===
                "present" ||
              record.status ===
                "late",
          ).length;

        const learnerAttendanceRate =
          learnerAttendanceTotal > 0
            ? (learnerAttendanceCount /
                learnerAttendanceTotal) *
              100
            : 100;

        const learnerAssessments =
          validAssessmentResults.filter(
            (result) =>
              result.learner_id ===
              learner.id,
          );

        const learnerAssessmentAverage =
          learnerAssessments.length > 0
            ? learnerAssessments.reduce(
                (total, result) =>
                  total +
                  Number(
                    result.percentage,
                  ),
                0,
              ) /
              learnerAssessments.length
            : null;

        const reasons: string[] =
          [];

        if (
          learnerAttendanceTotal >
            0 &&
          learnerAttendanceRate < 75
        ) {
          reasons.push(
            "Low attendance",
          );
        }

        if (
          learnerAssessmentAverage !==
            null &&
          learnerAssessmentAverage <
            60
        ) {
          reasons.push(
            "Low assessment",
          );
        }

        return {
          id: learner.id,
          name: learner.full_name,
          attendanceRate:
            learnerAttendanceRate,
          assessmentAverage:
            learnerAssessmentAverage,
          attendanceTotal:
            learnerAttendanceTotal,
          assessmentCount:
            learnerAssessments.length,
          needsAttention:
            reasons.length > 0,
          reasons,
        };
      },
    );

  const learnersNeedingAttention =
    learnerAnalytics
      .filter(
        (learner) =>
          learner.needsAttention,
      )
      .sort((a, b) => {
        if (
          a.attendanceRate !==
          b.attendanceRate
        ) {
          return (
            a.attendanceRate -
            b.attendanceRate
          );
        }

        return (
          (a.assessmentAverage ?? 100) -
          (b.assessmentAverage ?? 100)
        );
      });

  /*
   * Learner performance
   */

  const performanceByLearner =
    filteredLearnerList
      .map<PerformanceLearner | null>(
        (learner) => {
          const results =
            validAssessmentResults.filter(
              (result) =>
                result.learner_id ===
                learner.id,
            );

          if (results.length === 0) {
            return null;
          }

          const average =
            results.reduce(
              (total, result) =>
                total +
                Number(
                  result.percentage,
                ),
              0,
            ) / results.length;

          return {
            id: learner.id,
            name: learner.full_name,
            average,
            resultCount:
              results.length,
          };
        },
      )
      .filter(
        (
          learner,
        ): learner is PerformanceLearner =>
          learner !== null,
      )
      .sort(
        (a, b) =>
          a.average - b.average,
      );

  const lowPerformanceLearners =
    performanceByLearner.filter(
      (learner) =>
        learner.average < 60,
    );

  const formatPercentage = (
    value: number,
  ) =>
    `${value.toFixed(1)}%`;

  const rangeLabel =
    getDateRangeLabel(
      selectedRange,
    );

  const rangeDescription =
    getDateRangeDescription(
      selectedRange,
      startDate,
      endDate,
    );

  const selectedClassName =
    selectedClassId === "all"
      ? "All Classes"
      : classList.find(
          (item) =>
            item.id ===
            selectedClassId,
        )?.name ??
        "Selected Class";

  /*
   * Lessons by class
   */

  const lessonsByClass =
    lessonList.reduce<
      Record<
        string,
        {
          name: string;
          count: number;
        }
      >
    >((accumulator, lesson) => {
      const classId =
        lesson.class_id ??
        "unassigned";

      const className =
        lesson.class?.[0]?.name ??
        "Unassigned";

      if (!accumulator[classId]) {
        accumulator[classId] = {
          name: className,
          count: 0,
        };
      }

      accumulator[classId].count += 1;

      return accumulator;
    }, {});

  const lessonsByClassList =
    Object.values(
      lessonsByClass,
    ).sort(
      (a, b) =>
        b.count - a.count,
    );

  /*
   * Lessons by week
   */

  const getWeekStart = (
    date: Date,
  ) => {
    const result = new Date(date);
    const day = result.getDay();

    const diff =
      day === 0 ? -6 : 1 - day;

    result.setDate(
      result.getDate() + diff,
    );

    result.setHours(
      0,
      0,
      0,
      0,
    );

    return result;
  };

  const lessonsByWeek =
    lessonList.reduce<
      Record<
        string,
        {
          label: string;
          count: number;
        }
      >
    >((accumulator, lesson) => {
      if (!lesson.scheduled_at) {
        return accumulator;
      }

      const date = new Date(
        lesson.scheduled_at,
      );

      const weekStart =
        getWeekStart(date);

      const key =
        weekStart.toISOString();

      const weekEnd =
        new Date(weekStart);

      weekEnd.setDate(
        weekEnd.getDate() + 6,
      );

      const label = `${weekStart.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        },
      )} – ${weekEnd.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        },
      )}`;

      if (!accumulator[key]) {
        accumulator[key] = {
          label,
          count: 0,
        };
      }

      accumulator[key].count += 1;

      return accumulator;
    }, {});

  const lessonsByWeekList =
    Object.entries(
      lessonsByWeek,
    )
      .sort(
        ([first], [second]) =>
          new Date(first).getTime() -
          new Date(second).getTime(),
      )
      .map(
        ([, value]) => value,
      );

  const maxLessonsByClass =
    Math.max(
      ...lessonsByClassList.map(
        (item) => item.count,
      ),
      1,
    );

  const maxLessonsByWeek =
    Math.max(
      ...lessonsByWeekList.map(
        (item) => item.count,
      ),
      1,
    );

  return (
    <main className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Teaching Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review teaching activity,
            learner engagement, and learning
            performance.
          </p>
        </div>

        <form
          method="get"
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label
              htmlFor="class"
              className="mb-1 block text-xs font-medium text-gray-500"
            >
              Class
            </label>

            <select
              id="class"
              name="class"
              defaultValue={
                selectedClassId
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="all">
                All Classes
              </option>

              {classList.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="range"
              className="mb-1 block text-xs font-medium text-gray-500"
            >
              Date Range
            </label>

            <select
              id="range"
              name="range"
              defaultValue={
                selectedRange
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="this-month">
                This Month
              </option>

              <option value="last-month">
                Last Month
              </option>

              <option value="last-3-months">
                Last 3 Months
              </option>

              <option value="this-year">
                This Year
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Active filter summary */}

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
          {selectedClassName}
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
          {rangeLabel}
        </span>

        <span>
          {rangeDescription}
        </span>
      </div>

      {/* KPI */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Lessons Taught
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {lessonList.length}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {rangeLabel}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Active Learners
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {
              filteredLearnerList.length
            }
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {selectedClassId ===
            "all"
              ? "Currently active"
              : "Active in selected class"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Attendance Rate
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {formatPercentage(
              attendanceRate,
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Present + Late
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Assessment Average
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {formatPercentage(
              assessmentAverage,
            )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {
              validAssessmentResults.length
            }{" "}
            results
          </p>
        </div>
      </div>

      {/* Teaching Activity */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Teaching Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your teaching activity for{" "}
            {rangeLabel.toLowerCase()}.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Lessons by Week */}

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Lessons by Week
              </h3>

              <span className="text-xs text-gray-500">
                {lessonList.length} total
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {lessonsByWeekList.length >
              0 ? (
                lessonsByWeekList.map(
                  (week) => (
                    <div
                      key={week.label}
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {week.label}
                        </span>

                        <span className="font-medium text-gray-900">
                          {week.count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gray-900 transition-all"
                          style={{
                            width: `${Math.max(
                              (week.count /
                                maxLessonsByWeek) *
                                100,
                              4,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    No lessons scheduled
                    for this period.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lessons by Class */}

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Lessons by Class
              </h3>

              <span className="text-xs text-gray-500">
                {
                  lessonsByClassList.length
                }{" "}
                classes
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {lessonsByClassList.length >
              0 ? (
                lessonsByClassList.map(
                  (item) => (
                    <div
                      key={item.name}
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="truncate pr-4 text-gray-600">
                          {item.name}
                        </span>

                        <span className="font-medium text-gray-900">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gray-700 transition-all"
                          style={{
                            width: `${Math.max(
                              (item.count /
                                maxLessonsByClass) *
                                100,
                              4,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    No class activity
                    for this period.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Learner Engagement */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Learner Engagement
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Attendance overview and learners who
            may need additional attention.
          </p>
        </div>

        {/* Attendance Overview */}

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900">
            Attendance Overview
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">
                Present
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {attendancePresent}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {attendanceTotal > 0
                  ? formatPercentage(
                      (attendancePresent /
                        attendanceTotal) *
                        100,
                    )
                  : "0.0%"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">
                Late
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {attendanceLate}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {attendanceTotal > 0
                  ? formatPercentage(
                      (attendanceLate /
                        attendanceTotal) *
                        100,
                    )
                  : "0.0%"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">
                Absent
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {attendanceAbsent}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {attendanceTotal > 0
                  ? formatPercentage(
                      (attendanceAbsent /
                        attendanceTotal) *
                        100,
                    )
                  : "0.0%"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">
                Excused
              </p>

              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {attendanceExcused}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {attendanceTotal > 0
                  ? formatPercentage(
                      (attendanceExcused /
                        attendanceTotal) *
                        100,
                    )
                  : "0.0%"}
              </p>
            </div>
          </div>
        </div>

        {/* Learners Needing Attention */}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Learners Needing Attention
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Attendance below 75% or assessment
                average below 60%.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {
                learnersNeedingAttention.length
              }{" "}
              learner
              {learnersNeedingAttention.length !==
              1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            {learnersNeedingAttention.length >
            0 ? (
              <div className="divide-y divide-gray-200">
                {learnersNeedingAttention.map(
                  (learner) => (
                    <div
                      key={learner.id}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {learner.name}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {learner.reasons.map(
                            (reason) => (
                              <span
                                key={reason}
                                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                              >
                                {reason}
                              </span>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 text-right">
                        <div>
                          <p className="text-xs text-gray-500">
                            Attendance
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {learner.attendanceTotal >
                            0
                              ? formatPercentage(
                                  learner.attendanceRate,
                                )
                              : "No data"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Assessment
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {learner.assessmentAverage !==
                            null
                              ? formatPercentage(
                                  learner.assessmentAverage,
                                )
                              : "No data"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-gray-900">
                  No learners currently need
                  attention.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  All learners are currently above
                  the attention thresholds.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Learning Performance */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Learning Performance
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Overview of recorded assessment
            performance.
          </p>
        </div>

        {/* Assessment Summary */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">
              Average
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {formatPercentage(
                assessmentAverage,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">
              Highest
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {formatPercentage(
                assessmentHighest,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">
              Lowest
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {formatPercentage(
                assessmentLowest,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">
              Results
            </p>

            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {
                validAssessmentResults.length
              }
            </p>
          </div>
        </div>

        {/* Performance Distribution */}

        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-900">
            Performance Distribution
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Below 60%
                </span>

                <span className="font-medium text-gray-900">
                  {lowPerformanceCount}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-900"
                  style={{
                    width: `${
                      assessmentValues.length >
                      0
                        ? Math.max(
                            (lowPerformanceCount /
                              assessmentValues.length) *
                              100,
                            lowPerformanceCount >
                              0
                              ? 4
                              : 0,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  60–79%
                </span>

                <span className="font-medium text-gray-900">
                  {
                    mediumPerformanceCount
                  }
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-700"
                  style={{
                    width: `${
                      assessmentValues.length >
                      0
                        ? Math.max(
                            (mediumPerformanceCount /
                              assessmentValues.length) *
                              100,
                            mediumPerformanceCount >
                              0
                              ? 4
                              : 0,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  80% and above
                </span>

                <span className="font-medium text-gray-900">
                  {highPerformanceCount}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-500"
                  style={{
                    width: `${
                      assessmentValues.length >
                      0
                        ? Math.max(
                            (highPerformanceCount /
                              assessmentValues.length) *
                              100,
                            highPerformanceCount >
                              0
                              ? 4
                              : 0,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Low Performance Learners */}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Learners with Low Performance
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Learners with assessment average below
                60%.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {
                lowPerformanceLearners.length
              }
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            {lowPerformanceLearners.length >
            0 ? (
              <div className="divide-y divide-gray-200">
                {lowPerformanceLearners.map(
                  (learner) => (
                    <div
                      key={learner.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {learner.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            learner.resultCount
                          }{" "}
                          assessment
                          {learner.resultCount !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        {formatPercentage(
                          learner.average,
                        )}
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-gray-900">
                  No low-performance learners.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  No learner has an assessment
                  average below 60%.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Teaching Insights */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Teaching Insights
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900">
              Teaching Activity
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {lessonList.length > 0
                ? `You have ${lessonList.length} scheduled lesson${
                    lessonList.length !==
                    1
                      ? "s"
                      : ""
                  } for ${rangeLabel.toLowerCase()}.`
                : `No lessons are scheduled for ${rangeLabel.toLowerCase()} yet.`}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900">
              Learner Engagement
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {learnersNeedingAttention.length >
              0
                ? `${learnersNeedingAttention.length} learner${
                    learnersNeedingAttention.length !==
                    1
                      ? "s"
                      : ""
                  } may need additional attention based on attendance or assessment performance.`
                : "No learners currently fall below the attention thresholds."}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900">
              Learning Performance
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {validAssessmentResults.length >
              0
                ? `Assessment average is ${formatPercentage(
                    assessmentAverage,
                  )}, with ${lowPerformanceCount} result${
                    lowPerformanceCount !==
                    1
                      ? "s"
                      : ""
                  } below 60%.`
                : "There are no assessment results for this period yet."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}