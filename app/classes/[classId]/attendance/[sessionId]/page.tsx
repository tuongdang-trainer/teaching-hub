import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AttendanceRecordForm from "@/components/classes/attendance-record-form";
import CompleteAttendanceSessionButton from "@/components/classes/complete-attendance-session-button";

type AttendanceSession = {
  id: string;
  class_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  notes: string | null;
};

type ClassDetail = {
  id: string;
  name: string;
  level: string | null;
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
};

type ExistingRecord = {
  learner_id: string;
  status: string;
  note: string | null;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

function formatStatus(status: string) {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export default async function AttendanceSessionPage({
  params,
}: {
  params: Promise<{
    classId: string;
    sessionId: string;
  }>;
}) {
  const { classId, sessionId } = await params;

  const supabase = await createClient();

  // --------------------------------------------------
  // Get attendance session
  // --------------------------------------------------

  const { data: sessionData, error: sessionError } = await supabase
    .from("attendance_sessions")
    .select(
      `
        id,
        class_id,
        date,
        start_time,
        end_time,
        status,
        notes
      `
    )
    .eq("id", sessionId)
    .eq("class_id", classId)
    .maybeSingle();

  if (sessionError || !sessionData) {
    notFound();
  }

  const session = sessionData as AttendanceSession;

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

  const classDetail = classData as ClassDetail;

  // --------------------------------------------------
  // Get active learners in this class
  // --------------------------------------------------

  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from("class_enrollments")
    .select(
      `
        learner_id,
        learners (
          id,
          full_name,
          email,
          current_level
        )
      `
    )
    .eq("class_id", classId)
    .eq("status", "active");

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const learners: Learner[] = (enrollmentData ?? [])
    .map((enrollment) => {
      const learner = Array.isArray(enrollment.learners)
        ? enrollment.learners[0]
        : enrollment.learners;

      return learner;
    })
    .filter(Boolean) as Learner[];

  // --------------------------------------------------
  // Get existing attendance records
  // --------------------------------------------------

  const { data: attendanceRecordData, error: attendanceRecordError } =
    await supabase
      .from("attendance_records")
      .select(
        `
          learner_id,
          status,
          note
        `
      )
      .eq("session_id", sessionId);

  if (attendanceRecordError) {
    throw new Error(attendanceRecordError.message);
  }

  const existingRecords: ExistingRecord[] =
    (attendanceRecordData ?? []) as ExistingRecord[];

  // --------------------------------------------------
  // Attendance summary
  // --------------------------------------------------

  const presentCount = existingRecords.filter(
    (record) => record.status === "present"
  ).length;

  const absentCount = existingRecords.filter(
    (record) => record.status === "absent"
  ).length;

  const lateCount = existingRecords.filter(
    (record) => record.status === "late"
  ).length;

  const excusedCount = existingRecords.filter(
    (record) => record.status === "excused"
  ).length;

  const recordedCount = existingRecords.length;
  const totalLearners = learners.length;

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/classes/${classId}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Class
        </Link>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Attendance Session
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {formatDate(session.date)}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {classDetail.name}
          </p>
        </div>
      </div>

      {/* Session Overview */}
      <section className="rounded-2xl border bg-background">
        <div className="border-b px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Session Overview
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Attendance session information.
              </p>
            </div>

            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {formatStatus(session.status)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(session.date)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Class
            </p>

            <p className="mt-1 text-sm font-medium">
              {classDetail.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Learners
            </p>

            <p className="mt-1 text-sm font-medium">
              {totalLearners}
            </p>
          </div>
        </div>
      </section>

      {/* Attendance Summary */}
      <section className="rounded-2xl border bg-background">
        <div className="border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              Attendance Summary
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Current attendance records for this session.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recorded
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {recordedCount}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {totalLearners}
              </span>
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Present
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {presentCount}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Absent
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {absentCount}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Late
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {lateCount}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Excused
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {excusedCount}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t px-6 py-5">
          <CompleteAttendanceSessionButton
            sessionId={session.id}
            recordedCount={recordedCount}
            totalLearners={totalLearners}
          />
        </div>
      </section>

      {/* Attendance */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Record Attendance
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Mark attendance for each learner in this session.
          </p>
        </div>

        <AttendanceRecordForm
          sessionId={sessionId}
          learners={learners.map((learner) => ({
            id: learner.id,
            full_name: learner.full_name,
          }))}
          existingRecords={existingRecords}
        />
      </section>
    </main>
  );
}