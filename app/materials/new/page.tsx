"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const MATERIAL_TYPES = [
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

const LEVELS = [
  "Foundation",
  "Developing",
  "Advanced",
];

const ACCEPTED_EXTENSIONS = [
  ".ppt",
  ".pptx",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp3",
  ".wav",
  ".mp4",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function getExtension(fileName: string) {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";

  return `.${parts.pop()?.toLowerCase()}`;
}

function getMaterialType(extension: string) {
  switch (extension) {
    case ".ppt":
    case ".pptx":
      return "presentation";

    case ".pdf":
      return "pdf";

    case ".doc":
    case ".docx":
      return "document";

    case ".xls":
    case ".xlsx":
      return "document";

    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".webp":
    case ".gif":
      return "image";

    case ".mp3":
    case ".wav":
      return "audio";

    case ".mp4":
      return "video";

    default:
      return "other";
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function NewMaterialPage() {
  const supabase = useMemo(() => createClient(), []);

  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("presentation");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [skill, setSkill] = useState("");

  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredUnits = units.filter(
    (unit) => !courseId || unit.course_id === courseId
  );

  useEffect(() => {
    async function loadCourses() {
      setLoadingCourses(true);

      const { data, error } = await supabase
        .from("courses")
        .select("id, name, code")
        .order("name");

      if (error) {
        console.error("Failed to load courses:", error);
      }

      setCourses((data ?? []) as Course[]);
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

      const { data, error } = await supabase
        .from("curriculum_units")
        .select("id, course_id, title, unit_number")
        .eq("course_id", courseId)
        .order("unit_number", { ascending: true });

      if (error) {
        console.error("Failed to load units:", error);
      }

      setUnits((data ?? []) as Unit[]);
      setLoadingUnits(false);
    }

    loadUnits();
  }, [courseId, supabase]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setSuccess("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = getExtension(selectedFile.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError(
        `Unsupported file type. Please upload one of: ${ACCEPTED_EXTENSIONS.join(
          ", "
        )}`
      );
      event.target.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum file size is 500 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);

    if (!title.trim()) {
      const fileNameWithoutExtension = selectedFile.name.replace(
        /\.[^/.]+$/,
        ""
      );

      setTitle(fileNameWithoutExtension);
    }

    setType(getMaterialType(extension));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a material title.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const extension = getExtension(file.name);

      const safeFileName = file.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");

      const storagePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("teaching-materials")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { error: materialError } = await supabase
        .from("materials")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          type,
          file_name: file.name,
          storage_path: storagePath,
          file_extension: extension || null,
          mime_type: file.type || null,
          file_size: file.size,
          course_id: courseId || null,
          unit_id: unitId || null,
          level: level || null,
          topic: topic.trim() || null,
          skill: skill.trim() || null,
          created_by: user.id,
          status: "active",
        });

      if (materialError) {
        await supabase.storage
          .from("teaching-materials")
          .remove([storagePath]);

        throw new Error(
          `Material record could not be created: ${materialError.message}`
        );
      }

      setSuccess("Material uploaded successfully.");

      setFile(null);
      setTitle("");
      setDescription("");
      setType("presentation");
      setLevel("");
      setTopic("");
      setSkill("");
      setCourseId("");
      setUnitId("");

      const fileInput = document.getElementById(
        "material-file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (submitError) {
      console.error("Failed to create material:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while uploading the material."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div>
        <Link
          href="/materials"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Material Library
        </Link>

        <div className="mt-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Add Material
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Upload and organize a reusable teaching resource.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* File */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">File</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload a presentation, worksheet, PDF, document, image, audio, or
            video.
          </p>

          <div className="mt-5">
            <label
              htmlFor="material-file"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition hover:bg-gray-50"
            >
              <div className="text-4xl">📁</div>

              <p className="mt-3 text-sm font-medium">
                {file ? file.name : "Choose a file"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                PPT, PPTX, PDF, DOCX, XLSX, images, audio, video · Max 50 MB
              </p>

              <input
                id="material-file"
                type="file"
                className="hidden"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatFileSize(file.size)} ·{" "}
                      {file.type || "Unknown MIME type"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);

                      const fileInput = document.getElementById(
                        "material-file"
                      ) as HTMLInputElement | null;

                      if (fileInput) {
                        fileInput.value = "";
                      }
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Basic information */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div className="mt-5 grid gap-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Title <span className="text-red-500">*</span>
              </label>

              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Week 2 Daily Activities Presentation"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Briefly describe what this material is used for..."
                rows={4}
                className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* Classification */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Classification</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Classification helps you find and reuse materials later.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium"
              >
                Material Type
              </label>

              <select
                id="type"
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
              >
                {MATERIAL_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="level"
                className="mb-2 block text-sm font-medium"
              >
                Level
              </label>

              <select
                id="level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="">Select level</option>

                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="course"
                className="mb-2 block text-sm font-medium"
              >
                Course
              </label>

              <select
                id="course"
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setUnitId("");
                }}
                disabled={loadingCourses}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Select course"}
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
                Unit
              </label>

              <select
                id="unit"
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
                disabled={!courseId || loadingUnits}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {!courseId
                    ? "Select a course first"
                    : loadingUnits
                      ? "Loading units..."
                      : "Select unit"}
                </option>

                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unit_number ? `Unit ${unit.unit_number} — ` : ""}
                    {unit.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="topic"
                className="mb-2 block text-sm font-medium"
              >
                Topic
              </label>

              <input
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. Daily routines"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="skill"
                className="mb-2 block text-sm font-medium"
              >
                Skill
              </label>

              <input
                id="skill"
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
                placeholder="e.g. Speaking, Vocabulary"
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/materials"
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Uploading..." : "Upload Material"}
          </button>
        </div>
      </form>
    </main>
  );
}