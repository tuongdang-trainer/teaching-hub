"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ClassItem = {
  id: string;
  name: string;
};

type CreateAttendanceSessionFormProps = {
  classes: ClassItem[];
};

export default function CreateAttendanceSessionForm({
  classes,
}: CreateAttendanceSessionFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [classId, setClassId] = useState("");
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
    if (!date) {
      setDate(getToday());
    }
  }

  async function handleCreate() {
    if (!classId) {
      setError("Please select a class.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("attendance_sessions")
      .insert({
        class_id: classId,
        date,
        status: "scheduled",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (!data?.id) {
      setError("Attendance session was created, but no session ID was returned.");
      setLoading(false);
      return;
    }

    router.push(
      `/classes/${classId}/attendance/${data.id}`
    );
  }

  return (
    <div className="rounded-2xl border bg-background p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold">
          Create Attendance Session
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a new attendance session for a class.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="attendance-class"
            className="text-sm font-medium"
          >
            Class
          </label>

          <select
            id="attendance-class"
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value);
              setError("");
            }}
            disabled={loading}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              Select a class
            </option>

            {classes.map((classItem) => (
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
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
            onFocus={handleOpen}
            onChange={(event) => {
              setDate(event.target.value);
              setError("");
            }}
            disabled={loading}
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {classes.length === 0 && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">
            No classes are available. Create a class before
            creating an attendance session.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || classes.length === 0}
          className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Session"}
        </button>
      </div>
    </div>
  );
}