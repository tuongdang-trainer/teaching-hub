"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Unit = {
  id: string;
  unit_number: number | null;
  title: string;
};

export default function DeleteUnitPage() {
  const params = useParams<{ unitId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const unitId = params.unitId;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessonCount, setLessonCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUnit() {
      setLoading(true);
      setErrorMessage("");

      const [
        { data: unitData, error: unitError },
        { data: lessonData, error: lessonError },
      ] = await Promise.all([
        supabase
          .from("curriculum_units")
          .select("id, unit_number, title")
          .eq("id", unitId)
          .maybeSingle(),

        supabase
          .from("lessons")
          .select("id")
          .eq("unit_id", unitId),
      ]);

      if (unitError) {
        setErrorMessage(unitError.message);
        setLoading(false);
        return;
      }

      if (lessonError) {
        setErrorMessage(lessonError.message);
        setLoading(false);
        return;
      }

      if (!unitData) {
        setErrorMessage("Unit not found.");
        setLoading(false);
        return;
      }

      setUnit(unitData);
      setLessonCount(lessonData?.length ?? 0);
      setLoading(false);
    }

    loadUnit();
  }, [unitId]);

  async function handleDelete() {
    if (!unit) {
      return;
    }

    if (lessonCount > 0) {
      setErrorMessage(
        "This unit cannot be deleted because it still has lessons assigned to it.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${unit.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("curriculum_units")
      .delete()
      .eq("id", unitId);

    if (error) {
      setErrorMessage(error.message);
      setDeleting(false);
      return;
    }

    router.push("/units");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl space-y-6">
        <Link
          href={`/units/${unitId}`}
          className="text-sm text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Unit
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Loading unit...
          </p>
        </div>
      </main>
    );
  }

  if (!unit) {
    return (
      <main className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/units"
          className="text-sm text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Units
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {errorMessage || "Unit not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/units/${unitId}`}
          className="text-sm text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Unit
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          Delete Unit
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Permanently remove this curriculum unit.
        </p>
      </div>

      <div className="rounded-xl border border-red-200 bg-white p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-semibold text-red-900">
            Delete {unit.title}?
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            This action permanently deletes this curriculum unit.
            Make sure you no longer need it before continuing.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm text-gray-500">
              Unit Number
            </span>

            <span className="text-sm font-medium text-gray-900">
              {unit.unit_number ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm text-gray-500">
              Unit Title
            </span>

            <span className="text-sm font-medium text-gray-900">
              {unit.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Assigned Lessons
            </span>

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                lessonCount > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {lessonCount}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {lessonCount > 0 && (
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              This unit cannot be deleted because it has{" "}
              <strong>{lessonCount}</strong>{" "}
              {lessonCount === 1 ? "lesson" : "lessons"} assigned
              to it. Remove or reassign those lessons first.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            href={`/units/${unitId}`}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || lessonCount > 0}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Unit"}
          </button>
        </div>
      </div>
    </main>
  );
}