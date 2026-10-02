"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Learner = {
  id: string;
  full_name: string;
};

type ExistingRecord = {
  learner_id: string;
  status: string;
  note: string | null;
};

type AttendanceRecordFormProps = {
  sessionId: string;
  learners: Learner[];
  existingRecords: ExistingRecord[];
};

const ATTENDANCE_STATUSES = [
  {
    value: "present",
    label: "Present",
  },
  {
    value: "absent",
    label: "Absent",
  },
  {
    value: "late",
    label: "Late",
  },
  {
    value: "excused",
    label: "Excused",
  },
];

export default function AttendanceRecordForm({
  sessionId,
  learners,
  existingRecords,
}: AttendanceRecordFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const initialStatuses: Record<string, string> = {};

  learners.forEach((learner) => {
    const existingRecord = existingRecords.find(
      (record) => record.learner_id === learner.id
    );

    initialStatuses[learner.id] =
      existingRecord?.status || "present";
  });

  const [statuses, setStatuses] =
    useState<Record<string, string>>(initialStatuses);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleStatusChange(
    learnerId: string,
    status: string
  ) {
    setStatuses((current) => ({
      ...current,
      [learnerId]: status,
    }));

    setSuccess(false);
    setError("");
  }

  async function handleSave() {
    if (learners.length === 0) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    const records = learners.map((learner) => ({
      session_id: sessionId,
      learner_id: learner.id,
      status: statuses[learner.id] || "present",
    }));

    const { error: upsertError } = await supabase
      .from("attendance_records")
      .upsert(records, {
        onConflict: "session_id,learner_id",
      });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);

    router.refresh();
  }

  if (learners.length === 0) {
    return (
      <div className="rounded-2xl border bg-background px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No active learners to record attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-6 py-3 text-left font-medium">
                Learner
              </th>

              <th className="px-6 py-3 text-right font-medium">
                Attendance
              </th>
            </tr>
          </thead>

          <tbody>
            {learners.map((learner) => {
              const selectedStatus =
                ATTENDANCE_STATUSES.find(
                  (option) =>
                    option.value === statuses[learner.id]
                )?.label || "Present";

              return (
                <tr
                  key={learner.id}
                  className="border-b last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium">
                      {learner.full_name}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        Selected:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedStatus}
                        </span>
                      </span>

                      <div className="inline-flex rounded-lg border bg-background p-1">
                        {ATTENDANCE_STATUSES.map((option) => {
                          const selected =
                            statuses[learner.id] ===
                            option.value;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  learner.id,
                                  option.value
                                )
                              }
                              disabled={saving}
                              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                                selected
                                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                  : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">
            Attendance saved successfully.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}