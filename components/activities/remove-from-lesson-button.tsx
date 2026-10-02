"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RemoveFromLessonButtonProps = {
  activityId: string;
  lessonId: string;
};

export default function RemoveFromLessonButton({
  activityId,
  lessonId,
}: RemoveFromLessonButtonProps) {
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
      .eq("activity_id", activityId)
      .eq("lesson_id", lessonId);

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