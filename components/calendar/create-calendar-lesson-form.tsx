"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  code: string | null;
};

type Unit = {
  id: string;
  course_id: string | null;
  title: string;
  unit_number: number | null;
};

type ClassItem = {
  id: string;
  name: string;
};

type CreateCalendarLessonFormProps = {
  selectedDate: Date;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export default function CreateCalendarLessonForm({
  selectedDate,
  onClose,
  onCreated,
}: CreateCalendarLessonFormProps) {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [classId, setClassId] = useState("");

  const [lessonNumber, setLessonNumber] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const [status, setStatus] = useState("planned");

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      const [coursesResult, unitsResult, classesResult] =
        await Promise.all([
          supabase
            .from("courses")
            .select("id, name, code")
            .order("name", { ascending: true }),

          supabase
            .from("curriculum_units")
            .select("id, course_id, title, unit_number")
            .order("unit_number", { ascending: true }),

          supabase
            .from("classes")
            .select("id, name")
            .order("name", { ascending: true }),
        ]);

      if (coursesResult.error) {
        setError(coursesResult.error.message);
        setLoadingOptions(false);
        return;
      }

      if (unitsResult.error) {
        setError(unitsResult.error.message);
        setLoadingOptions(false);
        return;
      }

      if (classesResult.error) {
        setError(classesResult.error.message);
        setLoadingOptions(false);
        return;
      }

      setCourses(coursesResult.data ?? []);
      setUnits(unitsResult.data ?? []);
      setClasses(classesResult.data ?? []);
      setLoadingOptions(false);
    }

    loadOptions();
  }, [supabase]);

  const filteredUnits = units.filter(
    (unit) => unit.course_id === courseId
  );

  function formatDateForInput(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!courseId) {
      setError("Please select a course.");
      return;
    }

    if (!unitId) {
      setError("Please select a unit.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a lesson title.");
      return;
    }

    if (!startTime) {
      setError("Please select a start time.");
      return;
    }

    const parsedDuration = Number(duration);

    if (
      !Number.isFinite(parsedDuration) ||
      parsedDuration <= 0
    ) {
      setError("Please enter a valid duration.");
      return;
    }

    const parsedLessonNumber = lessonNumber
      ? Number(lessonNumber)
      : null;

    if (
  lessonNumber &&
  (parsedLessonNumber === null ||
    !Number.isInteger(parsedLessonNumber) ||
    parsedLessonNumber <= 0)
) {
  setError("Lesson number must be a positive whole number.");
  return;
}

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to create a lesson.");
      setLoading(false);
      return;
    }

    const scheduledAt = new Date(
      `${formatDateForInput(selectedDate)}T${startTime}:00`
    );

    const { error: insertError } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        unit_id: unitId,
        class_id: classId || null,
        teacher_id: user.id,
        lesson_number: parsedLessonNumber,
        title: title.trim(),
        topic: topic.trim() || null,
        duration: parsedDuration,
        status,
        scheduled_at: scheduledAt.toISOString(),
      });

    if (insertError) {
      console.error(
        "Failed to create scheduled lesson:",
        insertError
      );

      setError(insertError.message);
      setLoading(false);
      return;
    }

    await onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              Create / Schedule Lesson
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Schedule a lesson for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingOptions ? (
            <p className="text-sm text-gray-500">
              Loading options...
            </p>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Course
                  </label>

                  <select
                    value={courseId}
                    onChange={(event) => {
                      setCourseId(event.target.value);
                      setUnitId("");
                    }}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <option value="">Select course</option>

                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.code
                          ? `${course.code} — ${course.name}`
                          : course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Unit
                  </label>

                  <select
                    value={unitId}
                    onChange={(event) =>
                      setUnitId(event.target.value)
                    }
                    disabled={!courseId}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm disabled:bg-gray-50"
                  >
                    <option value="">
                      {courseId
                        ? "Select unit"
                        : "Select course first"}
                    </option>

                    {filteredUnits.map((unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.unit_number !== null
                          ? `Unit ${unit.unit_number} — ${unit.title}`
                          : unit.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Lesson Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={lessonNumber}
                    onChange={(event) =>
                      setLessonNumber(event.target.value)
                    }
                    placeholder="e.g. 1"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Class
                  </label>

                  <select
                    value={classId}
                    onChange={(event) =>
                      setClassId(event.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <option value="">No class assigned</option>

                    {classes.map((classItem) => (
                      <option
                        key={classItem.id}
                        value={classItem.id}
                      >
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Lesson Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Ask for and Give Personal Details"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Topic
                </label>

                <input
                  type="text"
                  value={topic}
                  onChange={(event) =>
                    setTopic(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Date
                  </label>

                  <input
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    disabled
                    className="w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(event.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Duration
                  </label>

                  <select
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="planned">Planned</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}