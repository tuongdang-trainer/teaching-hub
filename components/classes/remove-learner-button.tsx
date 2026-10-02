"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RemoveLearnerButtonProps = {
  enrollmentId: string;
  learnerName: string;
};

export default function RemoveLearnerButton({
  enrollmentId,
  learnerName,
}: RemoveLearnerButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    const confirmed = window.confirm(
      `Remove "${learnerName}" from this class?`
    );

    if (!confirmed) {
      return;
    }

    setRemoving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("class_enrollments")
      .update({
        status: "inactive",
        left_at: new Date().toISOString().split("T")[0],
      })
      .eq("id", enrollmentId);

    if (updateError) {
      setError(updateError.message);
      setRemoving(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        className="rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {removing ? "Removing..." : "Remove"}
      </button>

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}