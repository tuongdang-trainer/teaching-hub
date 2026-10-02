"use client";

type LearnerAttendanceSummaryItem = {
  learnerId: string;
  learnerName: string;
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
};

type LearnerAttendanceSummaryProps = {
  learners: LearnerAttendanceSummaryItem[];
};

export default function LearnerAttendanceSummary({
  learners,
}: LearnerAttendanceSummaryProps) {
  function getRateClass(rate: number) {
    if (rate >= 90) {
      return "bg-green-100 text-green-700";
    }

    if (rate >= 75) {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-6 py-4">
        <h2 className="font-semibold">
          Learner Attendance
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Attendance summary across recorded sessions.
        </p>
      </div>

      {learners.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <h3 className="font-medium">
            No attendance data yet
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Attendance data will appear here after sessions are
            recorded.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-6 py-3 font-medium">
                  Learner
                </th>

                <th className="px-6 py-3 text-center font-medium">
                  Sessions
                </th>

                <th className="px-6 py-3 text-center font-medium">
                  Present
                </th>

                <th className="px-6 py-3 text-center font-medium">
                  Late
                </th>

                <th className="px-6 py-3 text-center font-medium">
                  Absent
                </th>

                <th className="px-6 py-3 text-center font-medium">
                  Excused
                </th>

                <th className="px-6 py-3 text-center font-medium">
                  Attendance Rate
                </th>
              </tr>
            </thead>

            <tbody>
              {learners.map((learner) => (
                <tr
                  key={learner.learnerId}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium">
                      {learner.learnerName}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {learner.totalSessions}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {learner.present}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {learner.late}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {learner.absent}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {learner.excused}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRateClass(
                        learner.attendanceRate
                      )}`}
                    >
                      {learner.attendanceRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}