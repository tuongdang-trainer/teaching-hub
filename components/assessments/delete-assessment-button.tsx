"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeleteAssessmentButtonProps = {
  assessmentId: string;
  assessmentName: string;
};

export default function DeleteAssessmentButton({
  assessmentId,
  assessmentName,
}: DeleteAssessmentButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${assessmentName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    const { error: deleteError } =
      await supabase
        .from("assessments")
        .delete()
        .eq("id", assessmentId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/assessments");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex w-fit rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting
          ? "Deleting..."
          : "Delete Assessment"}
      </button>

      {error && (
        <p className="max-w-sm text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}