"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateUnitFormProps = {
  courseId: string;
  onCreated?: () => void;
};

export default function CreateUnitForm({
  courseId,
  onCreated,
}: CreateUnitFormProps) {
  const router = useRouter();

  const [unitNumber, setUnitNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Unit title is required.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to create a unit.");
      setLoading(false);
      return;
    }

    const parsedUnitNumber = unitNumber.trim()
      ? Number(unitNumber)
      : null;

    if (
      parsedUnitNumber !== null &&
      (!Number.isInteger(parsedUnitNumber) || parsedUnitNumber < 1)
    ) {
      setError("Unit number must be a positive whole number.");
      setLoading(false);
      return;
    }

    const objectiveList = objectives
      .split("\n")
      .map((objective) => objective.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase
      .from("curriculum_units")
      .insert({
        course_id: courseId,
        parent_id: null,
        unit_number: parsedUnitNumber,
        title: title.trim(),
        description: description.trim() || null,
        objectives: objectiveList.length > 0 ? objectiveList : null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setUnitNumber("");
    setTitle("");
    setDescription("");
    setObjectives("");

    setSuccess("Unit created successfully.");
    setLoading(false);

    router.refresh();
    onCreated?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#e7e9ed] bg-white p-6"
    >
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Add Unit
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add a unit or week to this course curriculum.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Unit Number
          </span>

          <input
            type="number"
            min="1"
            value={unitNumber}
            onChange={(event) => setUnitNumber(event.target.value)}
            placeholder="e.g. 1"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Unit Title *
          </span>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Week 1 — Personal Details"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-gray-800">
            Description
          </span>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Brief description of this unit..."
            rows={3}
            className="resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-gray-800">
            Learning Objectives
          </span>

          <textarea
            value={objectives}
            onChange={(event) => setObjectives(event.target.value)}
            placeholder={
              "Enter one objective per line...\ne.g. Ask for personal details\nGive personal information"
            }
            rows={4}
            className="resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />

          <span className="text-xs text-gray-500">
            Enter one learning objective per line.
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Unit"}
        </button>
      </div>
    </form>
  );
}