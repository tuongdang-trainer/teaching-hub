"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type DeleteCalendarLessonButtonProps = {
  lessonId: string;
  lessonTitle: string;
  onDeleted: () => void | Promise<void>;
};

export default function DeleteCalendarLessonButton({
  lessonId,
  lessonTitle,
  onDeleted,
}: DeleteCalendarLessonButtonProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lessonTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (deleteError) {
      console.error(
        "Failed to delete calendar lesson:",
        deleteError
      );

      setError(deleteError.message);
      setLoading(false);
      return;
    }

    await onDeleted();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-[11px] font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="mt-1 max-w-full text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}