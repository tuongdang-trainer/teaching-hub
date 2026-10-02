"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RemoveLessonMaterialButtonProps = {
  lessonMaterialId: string;
};

export default function RemoveLessonMaterialButton({
  lessonMaterialId,
}: RemoveLessonMaterialButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    const confirmed = window.confirm(
      "Remove this material from the lesson?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("lesson_materials")
      .delete()
      .eq("id", lessonMaterialId);

    if (deleteError) {
      console.error(
        "Failed to remove lesson material:",
        deleteError
      );
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading}
        className="text-xs font-medium text-gray-500 hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Removing..." : "Remove"}
      </button>

      {error && (
        <span className="text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}