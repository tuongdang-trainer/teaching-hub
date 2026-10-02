
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ENGLISH_LEVELS = [
  { value: "", label: "Select level" },
  { value: "beginner", label: "Beginner" },
  { value: "elementary", label: "Elementary" },
  { value: "pre_intermediate", label: "Pre-Intermediate" },
  { value: "intermediate", label: "Intermediate" },
  { value: "upper_intermediate", label: "Upper-Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function NewLearnerPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter the learner's full name.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("learners")
      .insert({
        full_name: fullName.trim(),
        email: email.trim() || null,
        current_level: currentLevel || null,
        status,
        notes: notes.trim() || null,
      });

    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    router.push("/learners");
    router.refresh();
  }

  function handleCancel() {
    router.push("/learners");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Learners
        </button>

        <h1 className="text-2xl font-semibold tracking-tight">
          Add Learner
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a learner profile with the basic information you
          need to manage their learning journey.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-card p-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="full-name"
            className="text-sm font-medium"
          >
            Full Name <span className="text-red-500">*</span>
          </label>

          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. Nguyen Van A"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="e.g. learner@example.com"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="current-level"
            className="text-sm font-medium"
          >
            Current English Level
          </label>

          <select
            id="current-level"
            value={currentLevel}
            onChange={(event) => setCurrentLevel(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {ENGLISH_LEVELS.map((level) => (
              <option
                key={level.value}
                value={level.value}
              >
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-medium"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium"
          >
            Notes
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add any useful notes about this learner..."
            rows={5}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Learner"}
          </button>
        </div>
      </form>
    </main>
  );
}
