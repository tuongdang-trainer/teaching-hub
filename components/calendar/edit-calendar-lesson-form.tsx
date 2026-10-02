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

type CalendarLesson = {
  id: string;
  course_id: string | null;
  unit_id: string | null;
  class_id: string | null;
  lesson_number: number | null;
  title: string;
  topic: string | null;
  duration: number | null;
  status: string;
  scheduled_at: string | null;
};

type EditCalendarLessonFormProps = {
  lesson: CalendarLesson;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "planned", label: "Planned" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateTimeForForm(scheduledAt: string | null) {
  if (!scheduledAt) {
    const now = new Date();

    return {
      date: formatDateForInput(now),
      time: "09:00",
    };
  }

  const date = new Date(scheduledAt);

  return {
    date: formatDateForInput(date),
    time: `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`,
  };
}

export default function EditCalendarLessonForm({
  lesson,
  onClose,
  onUpdated,
}: EditCalendarLessonFormProps) {
  const supabase = createClient();

  const initialDateTime = formatDateTimeForForm(lesson.scheduled_at);

  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [courseId, setCourseId] = useState(lesson.course_id ?? "");
  const [unitId, setUnitId] = useState(lesson.unit_id ?? "");
  const [classId, setClassId] = useState(lesson.class_id ?? "");

  const [lessonNumber, setLessonNumber] = useState(
    lesson.lesson_number?.toString() ?? ""
  );

  const [title, setTitle] = useState(lesson.title);
  const [topic, setTopic] = useState(lesson.topic ?? "");

  const [lessonDate, setLessonDate] = useState(initialDateTime.date);
  const [startTime, setStartTime] = useState(initialDateTime.time);

  const [duration, setDuration] = useState(
    lesson.duration?.toString() ?? "60"
  );

  const [status, setStatus] = useState(lesson.status || "planned");

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      const [coursesResult, unitsResult, classesResult] = await Promise.all([
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

  function handleCourseChange(value: string) {
    setCourseId(value);

    const currentUnitBelongsToCourse = units.some(
      (unit) => unit.id === unitId && unit.course_id === value
    );

    if (!currentUnitBelongsToCourse) {
      setUnitId("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    if (!lessonDate) {
      setError("Please select a lesson date.");
      return;
    }

    if (!startTime) {
      setError("Please select a start time.");
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

    const parsedDuration = Number(duration);

    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration <= 0
    ) {
      setError("Please select a valid duration.");
      return;
    }

    const scheduledAt = new Date(
      `${lessonDate}T${startTime}:00`
    );

    if (Number.isNaN(scheduledAt.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase
      .from("lessons")
      .update({
        course_id: courseId,
        unit_id: unitId,
        class_id: classId || null,
        lesson_number: parsedLessonNumber,
        title: title.trim(),
        topic: topic.trim() || null,
        duration: parsedDuration,
        status,
        scheduled_at: scheduledAt.toISOString(),
      })
      .eq("id", lesson.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await onUpdated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Lesson
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the lesson details and schedule.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingOptions ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Loading lesson options...
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-course"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Course
                  </label>

                  <select
                    id="edit-course"
                    value={courseId}
                    onChange={(event) =>
                      handleCourseChange(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="">Select course</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code
                          ? `${course.code} — ${course.name}`
                          : course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-unit"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Unit
                  </label>

                  <select
                    id="edit-unit"
                    value={unitId}
                    onChange={(event) =>
                      setUnitId(event.target.value)
                    }
                    disabled={!courseId}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {courseId
                        ? "Select unit"
                        : "Select course first"}
                    </option>

                    {filteredUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unit_number
                          ? `Unit ${unit.unit_number} — ${unit.title}`
                          : unit.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-lesson-number"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Lesson Number
                  </label>

                  <input
                    id="edit-lesson-number"
                    type="number"
                    min="1"
                    step="1"
                    value={lessonNumber}
                    onChange={(event) =>
                      setLessonNumber(event.target.value)
                    }
                    placeholder="e.g. 1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-class"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Class
                  </label>

                  <select
                    id="edit-class"
                    value={classId}
                    onChange={(event) =>
                      setClassId(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    <option value="">No class</option>

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
                <label
                  htmlFor="edit-title"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Lesson Title
                </label>

                <input
                  id="edit-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Ask for and Give Personal Details"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-topic"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Topic
                </label>

                <input
                  id="edit-topic"
                  type="text"
                  value={topic}
                  onChange={(event) =>
                    setTopic(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-date"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>

                  <input
                    id="edit-date"
                    type="date"
                    value={lessonDate}
                    onChange={(event) =>
                      setLessonDate(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-start-time"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>

                  <input
                    id="edit-start-time"
                    type="time"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-duration"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Duration
                  </label>

                  <select
                    id="edit-duration"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    {DURATION_OPTIONS.map((minutes) => (
                      <option
                        key={minutes}
                        value={minutes}
                      >
                        {minutes} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-status"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="edit-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}