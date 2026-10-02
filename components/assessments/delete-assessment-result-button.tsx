"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type DeleteAssessmentResultButtonProps = {
  resultId: string;
  learnerName: string;
};

export default function DeleteAssessmentResultButton({
  resultId,
  learnerName,
}: DeleteAssessmentResultButtonProps) {
  const supabase = createClient();

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete the assessment result for "${learnerName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    const { error: deleteError } =
      await supabase
        .from("assessment_results")
        .delete()
        .eq("id", resultId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting
          ? "Deleting..."
          : "Delete"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}