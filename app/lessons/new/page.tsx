"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import CreateLessonForm from "@/components/lessons/create-lesson-form";

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
};

export default function NewLessonPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      setLoadingCourses(true);
      setError("");

      const { data, error: coursesError } = await supabase
        .from("courses")
        .select("id, name, code")
        .order("name", { ascending: true });

      if (coursesError) {
        console.error("Failed to load courses:", coursesError);
        setError("Failed to load courses. Please try again.");
        setCourses([]);
      } else {
        setCourses((data ?? []) as Course[]);
      }

      setLoadingCourses(false);
    }

    loadCourses();
  }, [supabase]);

  useEffect(() => {
    async function loadUnits() {
      if (!courseId) {
        setUnits([]);
        setUnitId("");
        return;
      }

      setLoadingUnits(true);
      setError("");
      setUnitId("");

      const { data, error: unitsError } = await supabase
        .from("curriculum_units")
        .select("id, course_id, unit_number, title")
        .eq("course_id", courseId)
        .order("unit_number", { ascending: true });

      if (unitsError) {
        console.error("Failed to load units:", unitsError);
        setError("Failed to load units for this course. Please try again.");
        setUnits([]);
      } else {
        setUnits((data ?? []) as Unit[]);
      }

      setLoadingUnits(false);
    }

    loadUnits();
  }, [courseId, supabase]);

  const canCreateLesson = Boolean(courseId && unitId);

  return (
    <main className="space-y-8 p-8">
      <div>
        <Link
          href="/lessons"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Lessons
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create Lesson
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a lesson and connect it to the appropriate course and unit.
          </p>
        </div>
      </div>

      <section className="max-w-4xl rounded-xl border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Curriculum Context
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select the course and unit before creating the lesson.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="course"
              className="mb-2 block text-sm font-medium"
            >
              Course <span className="text-red-500">*</span>
            </label>

            <select
              id="course"
              value={courseId}
              onChange={(event) => {
                setCourseId(event.target.value);
              }}
              disabled={loadingCourses}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary disabled:bg-muted"
            >
              <option value="">
                {loadingCourses
                  ? "Loading courses..."
                  : "Select course"}
              </option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                  {course.code ? ` (${course.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="unit"
              className="mb-2 block text-sm font-medium"
            >
              Unit <span className="text-red-500">*</span>
            </label>

            <select
              id="unit"
              value={unitId}
              onChange={(event) => {
                setUnitId(event.target.value);
              }}
              disabled={!courseId || loadingUnits}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary disabled:bg-muted"
            >
              <option value="">
                {!courseId
                  ? "Select a course first"
                  : loadingUnits
                    ? "Loading units..."
                    : units.length === 0
                      ? "No units found"
                      : "Select unit"}
              </option>

              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit_number
                    ? `Unit ${unit.unit_number} — `
                    : ""}
                  {unit.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {courseId && !loadingUnits && units.length === 0 && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This course does not have any units yet. Create a unit before
            creating a lesson.
          </div>
        )}
      </section>

      {error && (
        <div className="max-w-4xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {canCreateLesson ? (
        <section className="max-w-4xl rounded-xl border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Lesson Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Define the lesson content, learning focus, duration, and status.
            </p>
          </div>

          <CreateLessonForm
            courseId={courseId}
            unitId={unitId}
          />
        </section>
      ) : (
        <section className="max-w-4xl rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="font-medium">
            Select a course and unit to continue
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Once the curriculum context is selected, the lesson form will
            appear here.
          </p>
        </section>
      )}
    </main>
  );
}