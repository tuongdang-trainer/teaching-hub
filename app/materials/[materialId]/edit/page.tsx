"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_name: string | null;
  file_extension: string | null;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  course_id: string | null;
  unit_id: string | null;
  level: string | null;
  topic: string | null;
  skill: string | null;
  status: string;
};

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

const materialTypes = [
  { value: "presentation", label: "Presentation" },
  { value: "worksheet", label: "Worksheet" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "template", label: "Template" },
  { value: "assessment", label: "Assessment" },
  { value: "other", label: "Other" },
];

const levels = [
  { value: "", label: "Select level" },
  { value: "Foundation", label: "Foundation" },
  { value: "Developing", label: "Developing" },
  { value: "Advanced", label: "Advanced" },
];

const statuses = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "draft", label: "Draft" },
];

export default function EditMaterialPage() {
  const params = useParams<{ materialId: string }>();
  const router = useRouter();

  const materialId = params.materialId;

  const [material, setMaterial] = useState<Material | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("other");
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const [
        materialResult,
        coursesResult,
        unitsResult,
      ] = await Promise.all([
        supabase
          .from("materials")
          .select(`
            id,
            title,
            description,
            type,
            file_name,
            file_extension,
            mime_type,
            file_size,
            storage_path,
            course_id,
            unit_id,
            level,
            topic,
            skill,
            status
          `)
          .eq("id", materialId)
          .maybeSingle(),

        supabase
          .from("courses")
          .select("id, name, code")
          .order("name", { ascending: true }),

        supabase
          .from("curriculum_units")
          .select("id, course_id, title, unit_number")
          .order("unit_number", { ascending: true }),
      ]);

      if (materialResult.error) {
        console.error(
          "Failed to load material:",
          materialResult.error
        );

        setError(materialResult.error.message);
        setLoading(false);
        return;
      }

      if (!materialResult.data) {
        setError("Material not found.");
        setLoading(false);
        return;
      }

      if (coursesResult.error) {
        console.error(
          "Failed to load courses:",
          coursesResult.error
        );
      }

      if (unitsResult.error) {
        console.error(
          "Failed to load units:",
          unitsResult.error
        );
      }

      const loadedMaterial =
        materialResult.data as Material;

      setMaterial(loadedMaterial);

      setTitle(loadedMaterial.title);
      setDescription(loadedMaterial.description ?? "");
      setType(loadedMaterial.type);
      setCourseId(loadedMaterial.course_id ?? "");
      setUnitId(loadedMaterial.unit_id ?? "");
      setLevel(loadedMaterial.level ?? "");
      setTopic(loadedMaterial.topic ?? "");
      setSkill(loadedMaterial.skill ?? "");
      setStatus(loadedMaterial.status);

      setCourses(
        (coursesResult.data ?? []) as Course[]
      );

      setUnits(
        (unitsResult.data ?? []) as Unit[]
      );

      setLoading(false);
    }

    loadData();
  }, [materialId]);

  const filteredUnits = units.filter(
    (unit) => unit.course_id === courseId
  );

  function handleCourseChange(
    nextCourseId: string
  ) {
    setCourseId(nextCourseId);

    const currentUnitStillValid = units.some(
      (unit) =>
        unit.id === unitId &&
        unit.course_id === nextCourseId
    );

    if (!currentUnitStillValid) {
      setUnitId("");
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Please enter a material title.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("materials")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        type,
        course_id: courseId || null,
        unit_id: unitId || null,
        level: level || null,
        topic: topic.trim() || null,
        skill: skill.trim() || null,
        status,
      })
      .eq("id", materialId);

    if (updateError) {
      console.error(
        "Failed to update material:",
        updateError
      );

      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess("Material updated successfully.");
    setSaving(false);

    router.push(`/materials/${materialId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-8">
        <div className="rounded-xl border bg-white p-8 text-sm text-muted-foreground">
          Loading material...
        </div>
      </main>
    );
  }

  if (!material) {
    return (
      <main className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            Material not found.
          </p>

          <button
            type="button"
            onClick={() => router.push("/materials")}
            className="mt-4 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to Materials
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8 p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => router.push("/materials")}
          className="transition hover:text-foreground"
        >
          Materials
        </button>

        <span>/</span>

        <button
          type="button"
          onClick={() =>
            router.push(`/materials/${materialId}`)
          }
          className="max-w-[240px] truncate transition hover:text-foreground"
        >
          {material.title}
        </button>

        <span>/</span>

        <span className="text-foreground">
          Edit
        </span>
      </div>

      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          Edit Material
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Update the material information and library
          metadata.
        </p>
      </section>

      {/* Form */}
      <section className="rounded-xl border bg-white p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium"
            >
              Material Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Business Meeting Slides"
              className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Briefly describe this material..."
              rows={4}
              className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* Type + Status */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium"
              >
                Type
              </label>

              <select
                id="type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              >
                {materialTypes.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              >
                {statuses.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course + Unit */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium"
              >
                Course
              </label>

              <select
                id="course"
                value={courseId}
                onChange={(event) =>
                  handleCourseChange(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              >
                <option value="">
                  No course
                </option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.name}
                    {course.code
                      ? ` (${course.code})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium"
              >
                Unit
              </label>

              <select
                id="unit"
                value={unitId}
                onChange={(event) =>
                  setUnitId(event.target.value)
                }
                disabled={!courseId}
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {courseId
                    ? "No unit"
                    : "Select a course first"}
                </option>

                {filteredUnits.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.unit_number !== null
                      ? `Unit ${unit.unit_number}: `
                      : ""}
                    {unit.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level + Topic + Skill */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium"
              >
                Level
              </label>

              <select
                id="level"
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              >
                {levels.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium"
              >
                Topic
              </label>

              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(event) =>
                  setTopic(event.target.value)
                }
                placeholder="e.g. Meetings"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="skill"
                className="block text-sm font-medium"
              >
                Skill
              </label>

              <input
                id="skill"
                type="text"
                value={skill}
                onChange={(event) =>
                  setSkill(event.target.value)
                }
                placeholder="e.g. Speaking"
                className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>

          {/* Existing File */}
          <div className="rounded-lg border bg-gray-50 p-5">
            <p className="text-sm font-medium">
              Current File
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {material.file_name ?? "No file attached"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              The current file will remain unchanged.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/materials/${materialId}`
                )
              }
              disabled={saving}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}