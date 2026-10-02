"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import CreateCalendarLessonForm from "@/components/calendar/create-calendar-lesson-form";
import DeleteCalendarLessonButton from "@/components/calendar/delete-calendar-lesson-button";
import EditCalendarLessonForm from "@/components/calendar/edit-calendar-lesson-form";
import { createClient } from "@/lib/supabase/client";

type CalendarLesson = {
  id: string;
  title: string;
  scheduled_at: string | null;
  duration: number | null;
  status: string;
  course_id: string | null;
  unit_id: string | null;
  class_id: string | null;
  class_name: string | null;
  lesson_number: number | null;
  topic: string | null;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarDays(month: Date): CalendarDay[] {
  const firstDay = getMonthStart(month);
  const startDay = firstDay.getDay();

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startDay);

  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    days.push({
      date,
      isCurrentMonth: date.getMonth() === month.getMonth(),
    });
  }

  return days;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function CalendarPage() {
  const supabase = useMemo(() => createClient(), []);

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date()
  );

  const [today] = useState(() => new Date());

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null
  );

  const [selectedLesson, setSelectedLesson] =
    useState<CalendarLesson | null>(null);

  const [lessons, setLessons] = useState<CalendarLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLessons() {
    setLoading(true);
    setError("");

    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    const { data, error: lessonsError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        scheduled_at,
        duration,
        status,
        course_id,
        unit_id,
        class_id,
        lesson_number,
        topic,
        classes (
          name
        )
      `)
      .gte("scheduled_at", monthStart.toISOString())
      .lt("scheduled_at", monthEnd.toISOString())
      .order("scheduled_at", { ascending: true });

    if (lessonsError) {
      console.error(
        "Failed to load calendar lessons:",
        lessonsError
      );

      setError(lessonsError.message);
      setLessons([]);
      setLoading(false);
      return;
    }

    const formattedLessons: CalendarLesson[] = (data ?? []).map(
      (lesson) => {
        const classData = Array.isArray(lesson.classes)
          ? lesson.classes[0]
          : lesson.classes;

        return {
          id: lesson.id,
          title: lesson.title,
          scheduled_at: lesson.scheduled_at,
          duration: lesson.duration,
          status: lesson.status,
          course_id: lesson.course_id,
          unit_id: lesson.unit_id,
          class_id: lesson.class_id,
          class_name: classData?.name ?? null,
          lesson_number: lesson.lesson_number,
          topic: lesson.topic,
        };
      }
    );

    setLessons(formattedLessons);
    setLoading(false);
  }

  useEffect(() => {
    loadLessons();
  }, [currentMonth]);

  const calendarDays = getCalendarDays(currentMonth);

  const lessonsByDate = useMemo(() => {
    const grouped: Record<string, CalendarLesson[]> = {};

    for (const lesson of lessons) {
      if (!lesson.scheduled_at) {
        continue;
      }

      const date = new Date(lesson.scheduled_at);
      const key = getDateKey(date);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(lesson);
    }

    return grouped;
  }, [lessons]);

  function goToPreviousMonth() {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  }

  function goToToday() {
    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);

    if (
      date.getMonth() !== currentMonth.getMonth() ||
      date.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(
        new Date(date.getFullYear(), date.getMonth(), 1)
      );
    }
  }

  function handleCloseCreateLesson() {
    setSelectedDate(null);
  }

  function handleCloseEditLesson() {
    setSelectedLesson(null);
  }

  async function handleLessonCreated() {
    setSelectedDate(null);
    await loadLessons();
  }

  async function handleLessonUpdated() {
    setSelectedLesson(null);
    await loadLessons();
  }

  async function handleLessonDeleted() {
    setSelectedLesson(null);
    await loadLessons();
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Calendar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View scheduled lessons and teaching activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDate(today)}
          className="inline-flex w-fit items-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Create Lesson
        </button>
      </section>

      {/* Calendar navigation */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            →
          </button>

          <span className="ml-2 text-sm text-gray-500">
            {lessons.length} scheduled{" "}
            {lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load calendar: {error}
        </div>
      )}

      {/* Calendar */}
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="border-r px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }) => {
            const dateKey = getDateKey(date);
            const dayLessons = lessonsByDate[dateKey] ?? [];
            const isToday = isSameDay(date, today);

            return (
              <div
                key={dateKey}
                className={`min-h-32 border-b border-r p-2 align-top transition hover:bg-gray-50 ${
                  isCurrentMonth
                    ? "bg-white"
                    : "bg-gray-50"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSelectDate(date)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition hover:bg-gray-200"
                    aria-label={`Create lesson on ${date.toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        isToday
                          ? "bg-black text-white"
                          : isCurrentMonth
                            ? "text-gray-700"
                            : "text-gray-400"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                </div>

                <div className="space-y-1">
                  {dayLessons.map((lesson) => {
                    const scheduledAt = lesson.scheduled_at
                      ? new Date(lesson.scheduled_at)
                      : null;

                    const lessonHref =
                      lesson.course_id && lesson.unit_id
                        ? `/courses/${lesson.course_id}/units/${lesson.unit_id}/lessons/${lesson.id}`
                        : null;

                    return (
                      <div
                        key={lesson.id}
                        className="rounded-lg border bg-gray-50 p-2 text-left transition hover:bg-gray-100"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLesson(lesson)
                          }
                          className="block w-full text-left"
                        >
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {lesson.title}
                          </p>

                          {scheduledAt && (
                            <p className="mt-1 text-[11px] text-gray-500">
                              {formatTime(scheduledAt)}
                              {lesson.duration
                                ? ` · ${lesson.duration} min`
                                : ""}
                            </p>
                          )}

                          {lesson.class_name && (
                            <p className="mt-1 truncate text-[11px] text-gray-500">
                              {lesson.class_name}
                            </p>
                          )}
                        </button>

                        <div className="mt-2 flex items-center gap-2 border-t pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedLesson(lesson)
                            }
                            className="text-[11px] font-medium text-gray-700 hover:text-black"
                          >
                            Edit
                          </button>

                          {lessonHref && (
                            <Link
                              href={lessonHref}
                              className="text-[11px] font-medium text-gray-500 hover:text-gray-900"
                            >
                              View
                            </Link>
                          )}

                          <DeleteCalendarLessonButton
                            lessonId={lesson.id}
                            lessonTitle={lesson.title}
                            onDeleted={handleLessonDeleted}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-500">
          Loading calendar...
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && lessons.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
          No lessons are scheduled for this month.
        </div>
      )}

      {/* Create Lesson Modal */}
      {selectedDate && (
        <CreateCalendarLessonForm
          selectedDate={selectedDate}
          onClose={handleCloseCreateLesson}
          onCreated={handleLessonCreated}
        />
      )}

      {/* Edit Lesson Modal */}
      {selectedLesson && (
        <EditCalendarLessonForm
          lesson={selectedLesson}
          onClose={handleCloseEditLesson}
          onUpdated={handleLessonUpdated}
        />
      )}
    </main>
  );
}