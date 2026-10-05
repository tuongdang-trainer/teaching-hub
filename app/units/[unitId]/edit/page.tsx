"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  code: string | null;
};

type Unit = {
  id: string;
  course_id: string;
  unit_number: number | null;
  title: string;
  description: string | null;
  objectives: string[] | null;
};

export default function EditUnitPage() {
  const params = useParams<{ unitId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const unitId = params.unitId;

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      const [
        { data: courseData, error: courseError },
        { data: unitData, error: unitError },
      ] = await Promise.all([
        supabase
          .from("courses")
          .select("id, name, code")
          .eq("status", "active")
          .order("name", { ascending: true }),

        supabase
          .from("curriculum_units")
          .select(
            "id, course_id, unit_number, title, description, objectives",
          )
          .eq("id", unitId)
          .maybeSingle(),
      ]);

      if (courseError) {
        setErrorMessage(courseError.message);
        setLoading(false);
        return;
      }

      if (unitError) {
        setErrorMessage(unitError.message);
        setLoading(false);
        return;
      }

      if (!unitData) {
        setErrorMessage("Unit not found.");
        setLoading(false);
        return;
      }

      setCourses(courseData ?? []);

      setCourseId(unitData.course_id);
      setUnitNumber(
        unitData.unit_number !== null
          ? String(unitData.unit_number)
          : "",
      );
      setTitle(unitData.title);
      setDescription(unitData.description ?? "");
      setObjectives(
        unitData.objectives?.join("\n") ?? "",
      );

      setLoading(false);
    }

    loadData();
  }, [unitId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    const trimmedTitle = title.trim();

    if (!courseId) {
      setErrorMessage("Please select a course.");
      return;
    }

    if (!trimmedTitle) {
      setErrorMessage("Please enter a unit title.");
      return;
    }

    const parsedUnitNumber = unitNumber.trim()
      ? Number(unitNumber)
      : null;

    if (
      parsedUnitNumber !== null &&
      (!Number.isInteger(parsedUnitNumber) ||
        parsedUnitNumber < 1)
    ) {
      setErrorMessage(
        "Unit number must be a positive whole number.",
      );
      return;
    }

    const objectiveList = objectives
      .split("\n")
      .map((objective) => objective.trim())
      .filter(Boolean);

    setSaving(true);

    const { error } = await supabase
      .from("curriculum_units")
      .update({
        course_id: courseId,
        unit_number: parsedUnitNumber,
        title: trimmedTitle,
        description: description.trim() || null,
        objectives:
          objectiveList.length > 0 ? objectiveList : null,
      })
      .eq("id", unitId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/units/${unitId}`);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl space-y-6">
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

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/units/${unitId}`}
          className="text-sm text-gray-500 transition hover:text-gray-900"
        >
          ← Back to Unit
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          Edit Unit
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the curriculum unit and its learning objectives.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
      >
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="course"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Course <span className="text-red-500">*</span>
          </label>

          <select
            id="course"
            value={courseId}
            onChange={(event) =>
              setCourseId(event.target.value)
            }
            disabled={saving || courses.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          >
            {courses.length === 0 ? (
              <option value="">
                No active courses available
              </option>
            ) : (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                  {course.code ? ` (${course.code})` : ""}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
          <div>
            <label
              htmlFor="unitNumber"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Unit Number
            </label>

            <input
              id="unitNumber"
              type="number"
              min="1"
              value={unitNumber}
              onChange={(event) =>
                setUnitNumber(event.target.value)
              }
              disabled={saving}
              placeholder="1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Unit Title <span className="text-red-500">*</span>
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={saving}
              placeholder="e.g. Personal Information"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={saving}
            rows={4}
            placeholder="Briefly describe what this unit covers..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label
            htmlFor="objectives"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Learning Objectives
          </label>

          <textarea
            id="objectives"
            value={objectives}
            onChange={(event) =>
              setObjectives(event.target.value)
            }
            disabled={saving}
            rows={5}
            placeholder={
              "Enter one objective per line.\nExample: Ask for personal details\nExample: Give basic personal information"
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />

          <p className="mt-2 text-xs text-gray-500">
            Enter one learning objective per line.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            href={`/units/${unitId}`}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || courses.length === 0}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}