"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type DeleteMaterialButtonProps = {
  materialId: string;
  storagePath: string | null;
};

export default function DeleteMaterialButton({
  materialId,
  storagePath,
}: DeleteMaterialButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material? The file will also be removed from storage."
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    if (storagePath) {
      const { error: storageError } =
        await supabase.storage
          .from("teaching-materials")
          .remove([storagePath]);

      if (storageError) {
        console.error(
          "Failed to delete material file:",
          storageError
        );

        setError(
          "The file could not be deleted. The material was not removed."
        );

        setLoading(false);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("materials")
      .delete()
      .eq("id", materialId);

    if (deleteError) {
      console.error(
        "Failed to delete material:",
        deleteError
      );

      setError(deleteError.message);
      setLoading(false);
      return;
    }

    router.push("/materials");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}