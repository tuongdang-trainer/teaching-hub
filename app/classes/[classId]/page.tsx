import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteClassButton from "@/components/classes/delete-class-button";
import AddLearnerButton from "@/components/classes/add-learner-button";
import RemoveLearnerButton from "@/components/classes/remove-learner-button";
import CreateAttendanceSessionButton from "@/components/classes/create-attendance-session-button";

type ClassDetail = {
  id: string;
  name: string;
  level: string | null;
  location: string | null;
  schedule: {
    description?: string;
  } | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
  course:
    | {
        name: string;
        code: string | null;
      }[]
    | null;
};

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
  current_level: string | null;
  status: string;
  enrollment_id: string;
};

type AttendanceSession = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  notes: string | null;
};

type AttendanceRecord = {
  session_id: string;
  status: string;
};

type AttendanceSummary = {
  recorded: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  if (value === "active") return "Active";
  if (value === "inactive") return "Inactive";
  if (value === "scheduled") return "Scheduled";
  if (value === "completed") return "Completed";
  if (value === "cancelled") return "Cancelled";

  return value;
}

function getStatusClasses(status: string) {
  if (status === "completed") {
    return "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700";
  }

  if (status === "scheduled") {
    return "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700";
  }

  if (status === "cancelled") {
    return "rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700";
  }

  return "rounded-full bg-muted px-2.5 py-1 text-xs font-medium";
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // Get class
  // --------------------------------------------------

  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select(
      `
        id,
        name,
        level,
        location,
        schedule,
        start_date,
        end_date,
        status,
        notes,
        course:courses (
          name,
          code
        )
      `
    )
    .eq("id", classId)
    .maybeSingle();

  if (classError || !classData) {
    notFound();
  }

  const classItem = classData as ClassDetail;

  // --------------------------------------------------
  // Get active learners
  // --------------------------------------------------

  const { data: enrollmentData } = await supabase
    .from("class_enrollments")
    .select(
      `
        id,
        learner:learners (
          id,
          full_name,
          email,
          current_level,
          status
        )
      `
    )
    .eq("class_id", classId)
    .eq("status", "active");

  const learners: Learner[] = (enrollmentData ?? [])
    .flatMap((item) => {
      const learner = Array.isArray(item.learner)
        ? item.learner[0]
        : item.learner;

      if (!learner) {
        return [];
      }

      return [
        {
          ...learner,
          enrollment_id: item.id,
        },
      ];
    })
    .filter(Boolean) as Learner[];

  // --------------------------------------------------
  // Get attendance sessions
  // --------------------------------------------------

  const { data: attendanceSessionData } = await supabase
    .from("attendance_sessions")
    .select(
      `
        id,
        date,
        start_time,
        end_time,
        status,
        notes
      `
    )
    .eq("class_id", classId)
    .order("date", { ascending: false });

  const attendanceSessions: AttendanceSession[] =
    (attendanceSessionData ?? []) as AttendanceSession[];

  // --------------------------------------------------
  // Get attendance records for these sessions
  // --------------------------------------------------

  const attendanceSessionIds = attendanceSessions.map(
    (session) => session.id
  );

  let attendanceRecords: AttendanceRecord[] = [];

  if (attendanceSessionIds.length > 0) {
    const { data: attendanceRecordData } = await supabase
      .from("attendance_records")
      .select(
        `
          session_id,
          status
        `
      )
      .in("session_id", attendanceSessionIds);

    attendanceRecords = (attendanceRecordData ??
      []) as AttendanceRecord[];
  }

  // --------------------------------------------------
  // Build attendance summary by session
  // --------------------------------------------------

  const attendanceSummaryBySession: Record<
    string,
    AttendanceSummary
  > = {};

  attendanceSessions.forEach((session) => {
    attendanceSummaryBySession[session.id] = {
      recorded: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };
  });

  attendanceRecords.forEach((record) => {
    const summary = attendanceSummaryBySession[record.session_id];

    if (!summary) {
      return;
    }

    summary.recorded += 1;

    if (record.status === "present") {
      summary.present += 1;
    }

    if (record.status === "absent") {
      summary.absent += 1;
    }

    if (record.status === "late") {
      summary.late += 1;
    }

    if (record.status === "excused") {
      summary.excused += 1;
    }
  });

  const course = classItem.course?.[0] ?? null;

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/classes"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Classes
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {classItem.name}
              </h1>

              <span
                className={
                  classItem.status === "active"
                    ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                    : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                }
              >
                {formatStatus(classItem.status)}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {classItem.level || "No level assigned"}
            </p>
          </div>

          <DeleteClassButton
            classId={classItem.id}
            className={classItem.name}
          />
        </div>
      </div>

      {/* Class Overview */}
      <section className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Class Overview</h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Course</p>

            <p className="mt-1 font-medium">
              {course?.name || "—"}
            </p>

            {course?.code && (
              <p className="text-xs text-muted-foreground">
                {course.code}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Level</p>

            <p className="mt-1 font-medium">
              {classItem.level || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Schedule
            </p>

            <p className="mt-1 font-medium">
              {classItem.schedule?.description || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Location
            </p>

            <p className="mt-1 font-medium">
              {classItem.location || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Start Date
            </p>

            <p className="mt-1 font-medium">
              {formatDate(classItem.start_date)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              End Date
            </p>

            <p className="mt-1 font-medium">
              {formatDate(classItem.end_date)}
            </p>
          </div>
        </div>

        {classItem.notes && (
          <div className="border-t px-6 py-5">
            <p className="text-sm text-muted-foreground">
              Notes
            </p>

            <p className="mt-1 text-sm">
              {classItem.notes}
            </p>
          </div>
        )}
      </section>

      {/* Learners */}
      <section className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Learners</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {learners.length} active learner
              {learners.length === 1 ? "" : "s"} enrolled
            </p>
          </div>

          <AddLearnerButton classId={classItem.id} />
        </div>

        {learners.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-medium">
              No learners enrolled yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Learners will appear here once they are enrolled
              in this class.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-6 py-3 font-medium">
                    Learner
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Email
                  </th>

                  <th className="px-6 py-3 font-medium">
                    English Level
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {learners.map((learner) => (
                  <tr
                    key={learner.id}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={"/learners/" + learner.id}
                        className="font-medium hover:underline"
                      >
                        {learner.full_name}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {learner.email || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {learner.current_level || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {formatStatus(learner.status)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <RemoveLearnerButton
                        enrollmentId={learner.enrollment_id}
                        learnerName={learner.full_name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Lessons + Attendance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Lessons</h2>
          </div>

          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No lessons assigned to this class yet.
            </p>
          </div>
        </section>

        {/* Attendance */}
        <section className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold">Attendance</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {attendanceSessions.length} session
                {attendanceSessions.length === 1 ? "" : "s"} created
              </p>
            </div>

            <CreateAttendanceSessionButton
              classId={classItem.id}
            />
          </div>

          {attendanceSessions.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No attendance sessions yet.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {attendanceSessions.map((session) => {
                const summary =
                  attendanceSummaryBySession[session.id] ?? {
                    recorded: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                  };

                return (
                  <div
                    key={session.id}
                    className="px-6 py-4 transition hover:bg-muted/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/classes/${classId}/attendance/${session.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {formatDate(session.date)}
                        </Link>

                        {session.start_time && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {session.start_time}
                            {session.end_time
                              ? ` – ${session.end_time}`
                              : ""}
                          </p>
                        )}
                      </div>

                      <span
                        className={getStatusClasses(
                          session.status
                        )}
                      >
                        {formatStatus(session.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-foreground">
                          {summary.recorded}
                        </span>{" "}
                        / {learners.length} recorded
                      </span>

                      <span>
                        Present{" "}
                        <span className="font-medium text-foreground">
                          {summary.present}
                        </span>
                      </span>

                      <span>
                        Absent{" "}
                        <span className="font-medium text-foreground">
                          {summary.absent}
                        </span>
                      </span>

                      <span>
                        Late{" "}
                        <span className="font-medium text-foreground">
                          {summary.late}
                        </span>
                      </span>

                      <span>
                        Excused{" "}
                        <span className="font-medium text-foreground">
                          {summary.excused}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}