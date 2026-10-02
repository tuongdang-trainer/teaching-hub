"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RemoveActivityButtonProps = {
  lessonId: string;
  activityId: string;
};

export default function RemoveActivityButton({
  lessonId,
  activityId,
}: RemoveActivityButtonProps) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    const confirmed = window.confirm(
      "Remove this activity from the lesson?"
    );

    if (!confirmed) {
      return;
    }

    setRemoving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("lesson_activities")
      .delete()
      .eq("lesson_id", lessonId)
      .eq("activity_id", activityId);

    if (error) {
      console.error(
        "Failed to remove activity from lesson:",
        error
      );

      window.alert(
        "Failed to remove the activity from this lesson."
      );

      setRemoving(false);
      return;
    }

    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={removing}
      className="shrink-0 rounded-lg border border-[#f0d4d4] bg-white px-3 py-2 text-sm font-medium text-[#b42318] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {removing ? "Removing..." : "Remove"}
    </button>
  );
}