"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CompleteAttendanceSessionButtonProps = {
  sessionId: string;
  recordedCount: number;
  totalLearners: number;
};

export default function CompleteAttendanceSessionButton({
  sessionId,
  recordedCount,
  totalLearners,
}: CompleteAttendanceSessionButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const canComplete =
    totalLearners > 0 && recordedCount === totalLearners;

  async function handleComplete() {
    if (!canComplete || completing) {
      return;
    }

    const confirmed = window.confirm(
      "Complete this attendance session? You can still edit attendance records later."
    );

    if (!confirmed) {
      return;
    }

    setCompleting(true);
    setError("");

    const { error: updateError } = await supabase
      .from("attendance_sessions")
      .update({
        status: "completed",
      })
      .eq("id", sessionId);

    if (updateError) {
      setError(updateError.message);
      setCompleting(false);
      return;
    }

    setCompleting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleComplete}
        disabled={!canComplete || completing}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {completing ? "Completing..." : "Complete Session"}
      </button>

      {!canComplete && (
        <p className="text-xs text-muted-foreground">
          Record attendance for all learners before completing this session.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}