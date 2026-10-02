"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  code: string | null;
};

const LEVELS = [
  "Foundation",
  "Communication",
  "Advanced",
];

export default function NewClassPage() {
  const router = useRouter();
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      const { data, error: coursesError } = await supabase
        .from("courses")
        .select("id, name, code")
        .order("name");

      if (coursesError) {
        setError(coursesError.message);
      } else {
        setCourses(data ?? []);
      }

      setLoadingCourses(false);
    }

    loadCourses();
  }, [supabase]);

  function handleCourseChange(value: string) {
    setCourseId(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a class name.");
      return;
    }

    if (!level) {
      setError("Please select a class level.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create a class.");
      setSaving(false);
      return;
    }

    const scheduleData = schedule.trim()
      ? { description: schedule.trim() }
      : null;

    const { error: insertError } = await supabase
      .from("classes")
      .insert({
        name: name.trim(),
        course_id: courseId || null,
        teacher_id: user.id,
        level: level,
        location: location.trim() || null,
        schedule: scheduleData,
        start_date: startDate || null,
        end_date: endDate || null,
        status,
        notes: notes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/classes");
    router.refresh();
  }

  function handleCancel() {
    router.push("/classes");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8">
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Classes
        </button>

        <h1 className="text-2xl font-semibold tracking-tight">
          Add Class
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a teaching group and define its basic schedule.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium"
          >
            Class Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. English 1 - Beginner"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="course"
            className="text-sm font-medium"
          >
            Course
          </label>

          <select
            id="course"
            value={courseId}
            onChange={(event) =>
              handleCourseChange(event.target.value)
            }
            disabled={loadingCourses}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">
              {loadingCourses
                ? "Loading courses..."
                : "Select a course"}
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.name}
                {course.code ? " (" + course.code + ")" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="level"
            className="text-sm font-medium"
          >
            Class Level
          </label>

          <select
            id="level"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">
              Select a level
            </option>

            {LEVELS.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <p className="text-xs text-muted-foreground">
            Class level is managed independently from the course level.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="location"
            className="text-sm font-medium"
          >
            Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            placeholder="e.g. Office / Online"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="schedule"
            className="text-sm font-medium"
          >
            Schedule
          </label>

          <input
            id="schedule"
            type="text"
            value={schedule}
            onChange={(event) =>
              setSchedule(event.target.value)
            }
            placeholder="e.g. Mon, Wed, Fri · 18:00–19:00"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="startDate"
              className="text-sm font-medium"
            >
              Start Date
            </label>

            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="endDate"
              className="text-sm font-medium"
            >
              End Date
            </label>

            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
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
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
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
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Add any notes about this class..."
            rows={4}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Class"}
          </button>
        </div>
      </form>
    </main>
  );
}