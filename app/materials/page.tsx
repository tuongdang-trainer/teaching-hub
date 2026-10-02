import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import MaterialLibrary from "@/components/materials/material-library";

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_name: string | null;
  file_extension: string | null;
  mime_type: string | null;
  file_size: number | null;
  level: string | null;
  topic: string | null;
  skill: string | null;
  status: string;
  created_at: string;
};

export default async function MaterialsPage() {
  const supabase = await createClient();

  const { data: materials, error } = await supabase
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
      level,
      topic,
      skill,
      status,
      created_at
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load materials:", error);
  }

  const materialList = (materials ?? []) as Material[];

  const presentationCount = materialList.filter(
    (material) => material.type === "presentation"
  ).length;

  const worksheetCount = materialList.filter(
    (material) => material.type === "worksheet"
  ).length;

  const otherCount = materialList.filter(
    (material) =>
      material.type !== "presentation" &&
      material.type !== "worksheet"
  ).length;

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Material Library
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Store, organize, and reuse your teaching materials.
          </p>
        </div>

        <Link
          href="/materials/new"
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
        >
          + Add Material
        </Link>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Total Materials
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {materialList.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Presentations
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {presentationCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Worksheets
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {worksheetCount}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Other Resources
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {otherCount}
          </p>
        </div>
      </section>

      {/* Materials */}
      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            Failed to load materials.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Please check the Supabase connection and database
            permissions.
          </p>
        </section>
      ) : materialList.length === 0 ? (
        <section className="rounded-xl border border-dashed bg-white p-12 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-4xl">📚</div>

            <h3 className="mt-4 text-lg font-semibold">
              No materials yet
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Start building your teaching library by adding
              your first presentation, worksheet, PDF, or other
              resource.
            </p>

            <Link
              href="/materials/new"
              className="mt-6 inline-flex rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Add your first material
            </Link>
          </div>
        </section>
      ) : (
        <MaterialLibrary materials={materialList} />
      )}
    </main>
  );
}