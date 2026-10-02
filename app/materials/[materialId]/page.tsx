import Link from "next/link";
import { notFound } from "next/navigation";

import DeleteMaterialButton from "@/components/materials/delete-material-button";
import { createClient } from "@/lib/supabase/server";

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_name: string;
  file_extension: string | null;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  level: string | null;
  topic: string | null;
  skill: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
};

type MaterialDetailPageProps = {
  params: Promise<{
    materialId: string;
  }>;
};

function formatFileSize(size: number | null) {
  if (!size) {
    return "—";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function MaterialDetailPage({
  params,
}: MaterialDetailPageProps) {
  const { materialId } = await params;

  const supabase = await createClient();

  const { data: materialData, error } = await supabase
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
      level,
      topic,
      skill,
      status,
      created_at,
      updated_at
    `)
    .eq("id", materialId)
    .single();

  if (error || !materialData) {
    notFound();
  }

  const material = materialData as Material;

  let fileUrl: string | null = null;
  let signedUrlError: string | null = null;

  if (material.storage_path) {
    const { data: signedUrlData, error: signedUrlErrorData } =
      await supabase.storage
        .from("teaching-materials")
        .createSignedUrl(material.storage_path, 60 * 60);

    if (signedUrlData?.signedUrl) {
      fileUrl = signedUrlData.signedUrl;
    }

    if (signedUrlErrorData) {
      signedUrlError = signedUrlErrorData.message;
    }
  }

  return (
    <main className="space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <Link href="/materials" className="hover:underline">
          Materials
        </Link>
        <span className="mx-2">/</span>
        <span>{material.title}</span>
      </div>

      {/* Header */}
      <section className="flex flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
              {material.type}
            </span>

            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-700">
              {material.status}
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {material.title}
          </h1>

          {material.description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              {material.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href={`/materials/${materialId}/edit`}
            className="inline-flex rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
          >
            Edit
          </Link>

          <DeleteMaterialButton
            materialId={material.id}
            storagePath={material.storage_path}
          />

          <Link
            href="/materials"
            className="inline-flex rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
          >
            Back to Materials
          </Link>
        </div>
      </section>

      {/* File */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">File</h2>

            <p className="mt-1 text-sm text-gray-500">
              {material.file_name}
            </p>
          </div>

          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Open File
            </a>
          ) : (
            <span className="text-sm text-red-600">
              File unavailable
            </span>
          )}
        </div>

        {signedUrlError && (
          <p className="mt-3 text-sm text-red-600">
            {signedUrlError}
          </p>
        )}
      </section>

      {/* Metadata */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Metadata</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              File Type
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {material.mime_type || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Extension
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {material.file_extension || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              File Size
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatFileSize(material.file_size)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Level
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {material.level || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Topic
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {material.topic || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Skill
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {material.skill || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Created
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatDate(material.created_at)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Updated
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatDate(material.updated_at)}
            </p>
          </div>
        </div>
      </section>

      {/* Related Information */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Related Information</h2>

        <p className="mt-2 text-sm text-gray-500">
          Lesson assignments and other related information will appear
          here in a future update.
        </p>
      </section>
    </main>
  );
}