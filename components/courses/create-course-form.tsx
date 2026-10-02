"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CreateCourseFormProps = {
  onCreated?: () => void;
};

export default function CreateCourseForm({
  onCreated,
}: CreateCourseFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [provider, setProvider] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Course name is required.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to create a course.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("courses").insert({
      name: name.trim(),
      code: code.trim() || null,
      description: description.trim() || null,
      level: level.trim() || null,
      provider: provider.trim() || null,
      duration: duration.trim() || null,
      status,
      created_by: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setName("");
    setCode("");
    setDescription("");
    setLevel("");
    setProvider("");
    setDuration("");
    setStatus("active");

    setSuccess("Course created successfully.");
    setLoading(false);

    onCreated?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#e7e9ed] bg-white p-6"
    >
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Create Course
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add a teaching program to your workspace.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Course Name *
          </span>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. English 1"
            required
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Course Code
          </span>

          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. ENG1"
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
            placeholder="Brief description of the course..."
            rows={3}
            className="resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Level
          </span>

          <input
            type="text"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            placeholder="e.g. Beginner"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Provider
          </span>

          <input
            type="text"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="e.g. Berlitz"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Duration
          </span>

          <input
            type="text"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="e.g. 48 hours"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-800">
            Status
          </span>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>
    </form>
  );
}