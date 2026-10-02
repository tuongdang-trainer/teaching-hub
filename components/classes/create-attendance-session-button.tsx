"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateAttendanceSessionButtonProps = {
  classId: string;
};

export default function CreateAttendanceSessionButton({
  classId,
}: CreateAttendanceSessionButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function handleOpen() {
    setDate(getToday());
    setError("");
    setOpen(true);
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setOpen(false);
    setError("");
  }

  async function handleCreate() {
    if (!date) {
      setError("Please select a date.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("attendance_sessions")
      .insert({
        class_id: classId,
        date,
        status: "scheduled",
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    setDate("");
    setLoading(false);

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition hover:opacity-90"
      >
        + New Session
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-white text-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  New Attendance Session
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a session for this class.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5">
              <label
                htmlFor="attendance-date"
                className="text-sm font-medium"
              >
                Session Date
              </label>

              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={loading}
                className="mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={loading || !date}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}