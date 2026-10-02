import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CreateLessonPlanForm from "@/components/lesson-plans/create-lesson-plan-form";
import AddLessonMaterialForm from "@/components/lesson-materials/add-lesson-material-form";
import RemoveLessonMaterialButton from "@/components/lesson-materials/remove-lesson-material-button";
import RemoveActivityButton from "@/components/lessons/remove-activity-button";

type LessonDetailPageProps = {
  params: Promise<{
    courseId: string;
    unitId: string;
    lessonId: string;
  }>;
};

type LessonMaterial = {
  id: string;
  material_id: string;
};

type Material = {
  id: string;
  title: string;
  type: string;
  file_name: string | null;
  file_extension: string | null;
  file_size: number | null;
  level: string | null;
  topic: string | null;
  skill: string | null;
};

type AssignedMaterial = {
  assignmentId: string;
  material: Material;
};

type LessonActivity = {
  id: string;
  lesson_id: string;
  activity_id: string;
  order_index: number | null;
  notes: string | null;
};

type Activity = {
  id: string;
  title: string;
  description: string | null;
  activity_type: string | null;
  level: string | null;
  skill: string | null;
  duration: number | null;
};

type AssignedActivity = {
  assignmentId: string;
  orderIndex: number | null;
  notes: string | null;
  activity: Activity;
};

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    presentation: "Presentation",
    worksheet: "Worksheet",
    pdf: "PDF",
    document: "Document",
    image: "Image",
    audio: "Audio",
    video: "Video",
    template: "Template",
    assessment: "Assessment",
    other: "Other",
  };

  return labels[type] ?? type;
}

function formatFileSize(size: number | null) {
  if (!size) {
    return null;
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function LessonDetailPage({
  params,
}: LessonDetailPageProps) {
  const { courseId, unitId, lessonId } = await params;

  const supabase = await createClient();

  const [
    { data: course, error: courseError },
    { data: unit, error: unitError },
    { data: lesson, error: lessonError },
    { data: lessonPlan, error: lessonPlanError },
    { data: lessonMaterials, error: lessonMaterialsError },
    { data: lessonActivities, error: lessonActivitiesError },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, code")
      .eq("id", courseId)
      .single(),

    supabase
      .from("curriculum_units")
      .select(
        "id, course_id, unit_number, title, description, objectives"
      )
      .eq("id", unitId)
      .eq("course_id", courseId)
      .single(),

    supabase
      .from("lessons")
      .select(
        "id, course_id, unit_id, teacher_id, lesson_number, title, topic, duration, objective, language_focus, vocabulary_focus, skill_focus, status, scheduled_at, created_at, updated_at"
      )
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .eq("unit_id", unitId)
      .single(),

    supabase
      .from("lesson_plans")
      .select(
        "id, lesson_id, opening, presentation, guided_practice, general_practice, performance, retry, teacher_notes, learner_notes"
      )
      .eq("lesson_id", lessonId)
      .maybeSingle(),

    supabase
      .from("lesson_materials")
      .select("id, material_id")
      .eq("lesson_id", lessonId),

    supabase
      .from("lesson_activities")
      .select(
        "id, lesson_id, activity_id, order_index, notes"
      )
      .eq("lesson_id", lessonId)
      .order("order_index", {
        ascending: true,
        nullsFirst: false,
      }),
  ]);

  if (courseError || !course) {
    notFound();
  }

  if (unitError || !unit) {
    notFound();
  }

  if (lessonError || !lesson) {
    notFound();
  }

  if (lessonPlanError) {
    console.error(
      "Failed to load lesson plan:",
      lessonPlanError
    );
  }

  if (lessonMaterialsError) {
    console.error(
      "FAILED_TO_LOAD_LESSON_MATERIALS",
      JSON.stringify({
        message: lessonMaterialsError.message,
        details: lessonMaterialsError.details,
        hint: lessonMaterialsError.hint,
        code: lessonMaterialsError.code,
      })
    );
  }

  if (lessonActivitiesError) {
    console.error(
      "FAILED_TO_LOAD_LESSON_ACTIVITIES",
      JSON.stringify({
        message: lessonActivitiesError.message,
        details: lessonActivitiesError.details,
        hint: lessonActivitiesError.hint,
        code: lessonActivitiesError.code,
      })
    );
  }

  const assignedLessonMaterials =
    (lessonMaterials ?? []) as LessonMaterial[];

  const assignedMaterialIds =
    assignedLessonMaterials.map(
      (lessonMaterial) => lessonMaterial.material_id
    );

  let assignedMaterials: Material[] = [];

  if (assignedMaterialIds.length > 0) {
    const { data: materials, error: materialsError } =
      await supabase
        .from("materials")
        .select(
          "id, title, type, file_name, file_extension, file_size, level, topic, skill"
        )
        .in("id", assignedMaterialIds)
        .eq("status", "active");

    if (materialsError) {
      console.error(
        "Failed to load assigned materials:",
        materialsError
      );
    } else {
      assignedMaterials = (materials ?? []) as Material[];
    }
  }

  const assignedMaterialRows: AssignedMaterial[] =
    assignedLessonMaterials
      .map((lessonMaterial) => {
        const material = assignedMaterials.find(
          (item) =>
            item.id === lessonMaterial.material_id
        );

        if (!material) {
          return null;
        }

        return {
          assignmentId: lessonMaterial.id,
          material,
        };
      })
      .filter(
        (
          item
        ): item is AssignedMaterial => item !== null
      );

  const assignedLessonActivities =
    (lessonActivities ?? []) as LessonActivity[];

  const assignedActivityIds =
    assignedLessonActivities.map(
      (lessonActivity) => lessonActivity.activity_id
    );

  let assignedActivities: Activity[] = [];

  if (assignedActivityIds.length > 0) {
    const { data: activities, error: activitiesError } =
      await supabase
        .from("activities")
        .select(
          "id, title, description, activity_type, level, skill, duration"
        )
        .in("id", assignedActivityIds);

    if (activitiesError) {
      console.error(
        "Failed to load assigned activities:",
        activitiesError
      );
    } else {
      assignedActivities = (activities ?? []) as Activity[];
    }
  }

  const assignedActivityRows: AssignedActivity[] =
    assignedLessonActivities
      .map((lessonActivity) => {
        const activity = assignedActivities.find(
          (item) =>
            item.id === lessonActivity.activity_id
        );

        if (!activity) {
          return null;
        }

        return {
          assignmentId: lessonActivity.id,
          orderIndex: lessonActivity.order_index,
          notes: lessonActivity.notes,
          activity,
        };
      })
      .filter(
        (
          item
        ): item is AssignedActivity => item !== null
      );

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/courses"
            className="hover:text-gray-900"
          >
            Courses
          </Link>

          <span>›</span>

          <Link
            href={`/courses/${courseId}`}
            className="hover:text-gray-900"
          >
            {course.name}
          </Link>

          <span>›</span>

          <Link
            href={`/courses/${courseId}/units/${unitId}`}
            className="hover:text-gray-900"
          >
            {unit.title}
          </Link>

          <span>›</span>

          <span className="text-gray-900">
            Lesson {lesson.lesson_number ?? "—"}
          </span>
        </div>

        {/* Lesson Header */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Lesson {lesson.lesson_number ?? "—"}
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {lesson.title}
              </h1>

              {lesson.topic && (
                <p className="mt-2 text-base text-gray-500">
                  {lesson.topic}
                </p>
              )}
            </div>

            <Link
              href={`/courses/${courseId}/units/${unitId}`}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Unit
            </Link>
          </div>
        </section>

        {/* Lesson Overview */}
        <section className="mb-6 rounded-xl border border-[#e7e9ed] bg-white">
          <div className="border-b border-[#e7e9ed] px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900">
              Lesson Overview
            </h2>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Course
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {course.name}
              </p>

              {course.code && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {course.code}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Unit
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {unit.title}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Duration
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {lesson.duration
                  ? `${lesson.duration} minutes`
                  : "Not set"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Status
              </p>

              <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                {lesson.status}
              </span>
            </div>
          </div>
        </section>

        {/* Teaching Information */}
        <section className="mb-6 rounded-xl border border-[#e7e9ed] bg-white">
          <div className="border-b border-[#e7e9ed] px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900">
              Teaching Information
            </h2>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Learning Objective
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {lesson.objective ||
                  "No objective added yet."}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Language Focus
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lesson.language_focus || "Not set"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Vocabulary Focus
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lesson.vocabulary_focus || "Not set"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Skill Focus
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lesson.skill_focus || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lesson Plan */}
        <section className="mb-6 rounded-xl border border-[#e7e9ed] bg-white">
          <div className="border-b border-[#e7e9ed] px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900">
              Lesson Plan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Build the teaching flow for this lesson.
            </p>
          </div>

          {!lessonPlan ? (
            <div className="bg-[#fafafa] p-6">
              <CreateLessonPlanForm
                lessonId={lessonId}
              />
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {/* Opening */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  1. Opening
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lessonPlan.opening || "Not added"}
                </p>
              </div>

              {/* Presentation */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  2. Presentation
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lessonPlan.presentation || "Not added"}
                </p>
              </div>

              {/* Guided Practice */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  3. Guided Practice
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lessonPlan.guided_practice ||
                    "Not added"}
                </p>
              </div>

              {/* General Practice */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  4. General Practice
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lessonPlan.general_practice ||
                    "Not added"}
                </p>
              </div>

              {/* Performance */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  5. Performance
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lessonPlan.performance ||
                    "Not added"}
                </p>
              </div>

              {/* Retry */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  6. Retry
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {lessonPlan.retry || "Not added"}
                </p>
              </div>

              {/* Notes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Teacher Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {lessonPlan.teacher_notes ||
                      "Not added"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Learner Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {lessonPlan.learner_notes ||
                      "Not added"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Materials */}
        <section className="mb-6 rounded-xl border border-[#e7e9ed] bg-white">
          <div className="border-b border-[#e7e9ed] px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900">
              Materials
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Assign reusable teaching materials to this lesson.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {/* Assigned Materials */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Assigned Materials
                </h3>

                <span className="text-xs text-gray-500">
                  {assignedMaterialRows.length}{" "}
                  {assignedMaterialRows.length === 1
                    ? "material"
                    : "materials"}
                </span>
              </div>

              {assignedMaterialRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No materials assigned yet.
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Add a material below to use it in this lesson.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedMaterialRows.map(
                    ({ assignmentId, material }) => (
                      <div
                        key={assignmentId}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {material.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                              <span>
                                {getTypeLabel(
                                  material.type
                                )}
                              </span>

                              {material.level && (
                                <>
                                  <span>·</span>
                                  <span>
                                    {material.level}
                                  </span>
                                </>
                              )}

                              {material.topic && (
                                <>
                                  <span>·</span>
                                  <span>
                                    {material.topic}
                                  </span>
                                </>
                              )}

                              {material.skill && (
                                <>
                                  <span>·</span>
                                  <span>
                                    {material.skill}
                                  </span>
                                </>
                              )}
                            </div>

                            {material.file_name && (
                              <p className="mt-2 truncate text-xs text-gray-500">
                                {material.file_name}
                                {formatFileSize(
                                  material.file_size
                                )
                                  ? ` · ${formatFileSize(
                                      material.file_size
                                    )}`
                                  : ""}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              Assigned
                            </span>

                            <RemoveLessonMaterialButton
                              lessonMaterialId={
                                assignmentId
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Add Material */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Add Material
              </h3>

              <AddLessonMaterialForm
                lessonId={lessonId}
                assignedMaterialIds={assignedMaterialIds}
              />
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="mb-6 rounded-xl border border-[#e7e9ed] bg-white">
          <div className="border-b border-[#e7e9ed] px-6 py-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Activities
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Reusable classroom activities assigned to this lesson.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {assignedActivityRows.length}{" "}
                  {assignedActivityRows.length === 1
                    ? "activity"
                    : "activities"}
                </span>

                <Link
                  href={`/courses/${courseId}/units/${unitId}/lessons/${lessonId}/add-activity`}
                  className="inline-flex items-center rounded-lg border border-[#dfe3e8] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#f8fafc]"
                >
                  + Add Activity
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {assignedActivityRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No activities assigned yet.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add an activity from the Activity Library to use it in
                  this lesson.
                </p>

                <Link
                  href={`/courses/${courseId}/units/${unitId}/lessons/${lessonId}/add-activity`}
                  className="mt-4 inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add Activity
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedActivityRows.map(
                  ({
                    assignmentId,
                    orderIndex,
                    notes,
                    activity,
                  }) => (
                    <div
                      key={assignmentId}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {orderIndex !== null && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                #{orderIndex}
                              </span>
                            )}

                            {activity.activity_type && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {activity.activity_type}
                              </span>
                            )}

                            {activity.level && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {activity.level}
                              </span>
                            )}

                            {activity.skill && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {activity.skill}
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/activities/${activity.id}`}
                            className="mt-2 block text-base font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {activity.title}
                          </Link>

                          {activity.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
                              {activity.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            {activity.duration !== null && (
                              <span>
                                {activity.duration} minutes
                              </span>
                            )}

                            {notes && (
                              <>
                                <span>·</span>
                                <span>{notes}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <Link
                            href={`/activities/${activity.id}`}
                            className="rounded-lg border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f8fafc]"
                          >
                            View
                          </Link>

                          <RemoveActivityButton
                            lessonId={lessonId}
                            activityId={activity.id}
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* Vocabulary */}
        <section className="rounded-xl border border-[#e7e9ed] bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">
            Vocabulary
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Lesson vocabulary will appear here.
          </p>
        </section>
      </div>
    </main>
  );
}