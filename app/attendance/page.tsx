import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CreateAttendanceSessionForm from "@/components/attendance/create-attendance-session-form";
import AttendanceSessionFilters from "@/components/attendance/attendance-session-filters";
import LearnerAttendanceSummary from "@/components/attendance/learner-attendance-summary";

type AttendanceSession = {
  id: string;
  class_id: string;
  date: string;
  status: string;
};

type ClassInfo = {
  id: string;
  name: string;
  status: string;
};

type AttendanceRecord = {
  session_id: string;
  learner_id: string;
  status: string;
};

type Learner = {
  id: string;
  full_name: string;
};

type ClassEnrollment = {
  class_id: string;
  learner_id: string;
  status: string;
};

export default async function AttendancePage() {
  const supabase = await createClient();

  const { data: sessions, error: sessionsError } = await supabase
    .from("attendance_sessions")
    .select("id, class_id, date, status")
    .order("date", { ascending: false });

  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("id, name, status")
    .order("name", { ascending: true });

  const attendanceSessions =
    (sessions as AttendanceSession[]) ?? [];

  const classList =
    (classes as ClassInfo[]) ?? [];

  const activeClasses = classList.filter(
    (classItem) => classItem.status === "active"
  );

  const totalSessions = attendanceSessions.length;

  const scheduledSessions = attendanceSessions.filter(
    (session) => session.status === "scheduled"
  ).length;

  const completedSessions = attendanceSessions.filter(
    (session) => session.status === "completed"
  ).length;

  const sessionIds = attendanceSessions.map(
    (session) => session.id
  );

  const classIds = Array.from(
    new Set(
      attendanceSessions.map(
        (session) => session.class_id
      )
    )
  );

  let attendanceRecords: AttendanceRecord[] = [];

  if (sessionIds.length > 0) {
    const { data: records } = await supabase
      .from("attendance_records")
      .select(
        "session_id, learner_id, status"
      )
      .in("session_id", sessionIds);

    attendanceRecords =
      (records as AttendanceRecord[]) ?? [];
  }

  let enrollments: ClassEnrollment[] = [];

  if (classIds.length > 0) {
    const { data: enrollmentData } = await supabase
      .from("class_enrollments")
      .select("class_id, learner_id, status")
      .in("class_id", classIds);

    enrollments =
      (enrollmentData as ClassEnrollment[]) ?? [];
  }

  const learnerIds = Array.from(
    new Set(
      enrollments.map(
        (enrollment) => enrollment.learner_id
      )
    )
  );

  let learnerList: Learner[] = [];

  if (learnerIds.length > 0) {
    const { data: learners } = await supabase
      .from("learners")
      .select("id, full_name")
      .in("id", learnerIds)
      .order("full_name", {
        ascending: true,
      });

    learnerList =
      (learners as Learner[]) ?? [];
  }

  const learnerMap = new Map(
    learnerList.map((learner) => [
      learner.id,
      learner.full_name,
    ])
  );

  const enrollmentMap = new Map<string, Set<string>>();

  enrollments.forEach((enrollment) => {
    if (enrollment.status !== "active") {
      return;
    }

    const existing =
      enrollmentMap.get(enrollment.class_id) ??
      new Set<string>();

    existing.add(enrollment.learner_id);

    enrollmentMap.set(
      enrollment.class_id,
      existing
    );
  });

  const summaryMap = new Map<
    string,
    {
      learnerId: string;
      learnerName: string;
      totalSessions: number;
      present: number;
      late: number;
      absent: number;
      excused: number;
    }
  >();

  attendanceSessions.forEach((session) => {
    const learnerIdsForClass =
      enrollmentMap.get(session.class_id);

    if (!learnerIdsForClass) {
      return;
    }

    learnerIdsForClass.forEach((learnerId) => {
      const learnerName =
        learnerMap.get(learnerId);

      if (!learnerName) {
        return;
      }

      const current =
        summaryMap.get(learnerId) ?? {
          learnerId,
          learnerName,
          totalSessions: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
        };

      current.totalSessions += 1;

      const record = attendanceRecords.find(
        (item) =>
          item.session_id === session.id &&
          item.learner_id === learnerId
      );

      if (record?.status === "present") {
        current.present += 1;
      }

      if (record?.status === "late") {
        current.late += 1;
      }

      if (record?.status === "absent") {
        current.absent += 1;
      }

      if (record?.status === "excused") {
        current.excused += 1;
      }

      summaryMap.set(
        learnerId,
        current
      );
    });
  });

  const learnerAttendanceSummary =
    Array.from(summaryMap.values()).map(
      (item) => {
        const attendanceRate =
          item.totalSessions > 0
            ? ((item.present + item.late) /
                item.totalSessions) *
              100
            : 0;

        return {
          ...item,
          attendanceRate,
        };
      }
    );

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Record and review learner attendance across classes.
        </p>
      </div>

      {/* Create Session */}
      <CreateAttendanceSessionForm
        classes={activeClasses}
      />

      {/* Errors */}
      {sessionsError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load attendance sessions:{" "}
          {sessionsError.message}
        </div>
      )}

      {classesError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load classes:{" "}
          {classesError.message}
        </div>
      )}

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Sessions
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalSessions}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Scheduled
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {scheduledSessions}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Completed
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {completedSessions}
          </p>
        </div>
      </section>

      {/* Sessions */}
      <section>
        <div className="mb-4">
          <h2 className="font-semibold">
            Attendance Sessions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a session to record or review attendance.
          </p>
        </div>

        {attendanceSessions.length === 0 ? (
          <div className="rounded-xl border bg-card px-6 py-12 text-center">
            <h3 className="font-medium">
              No attendance sessions yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Create your first attendance session above.
            </p>

            <Link
              href="/classes"
              className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              View Classes
            </Link>
          </div>
        ) : (
          <AttendanceSessionFilters
            sessions={attendanceSessions}
            classes={classList}
          />
        )}
      </section>

      {/* Learner Attendance Summary */}
      <LearnerAttendanceSummary
        learners={learnerAttendanceSummary}
      />
    </main>
  );
}