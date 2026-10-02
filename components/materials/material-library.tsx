"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

type MaterialLibraryProps = {
  materials: Material[];
};

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "—";
  }

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

export default function MaterialLibrary({
  materials,
}: MaterialLibraryProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesSearch =
        !normalizedSearch ||
        material.title.toLowerCase().includes(normalizedSearch) ||
        material.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        material.topic
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        material.skill
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        material.file_name
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesType =
        !typeFilter || material.type === typeFilter;

      const matchesLevel =
        !levelFilter || material.level === levelFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesLevel
      );
    });
  }, [materials, search, typeFilter, levelFilter]);

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "" ||
    levelFilter !== "";

  function handleReset() {
    setSearch("");
    setTypeFilter("");
    setLevelFilter("");
  }

  return (
    <>
      {/* Search / Filters */}
      <section className="rounded-xl border bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search materials..."
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
            >
              <option value="">All types</option>
              <option value="presentation">Presentation</option>
              <option value="worksheet">Worksheet</option>
              <option value="pdf">PDF</option>
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="template">Template</option>
              <option value="assessment">Assessment</option>
              <option value="other">Other</option>
            </select>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value)
              }
              className="rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-black"
            >
              <option value="">All levels</option>
              <option value="Foundation">Foundation</option>
              <option value="Developing">Developing</option>
              <option value="Advanced">Advanced</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Material list */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              All Materials
            </h2>

            {hasFilters && (
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredMaterials.length} of{" "}
                {materials.length} materials
              </p>
            )}
          </div>

          <span className="text-sm text-muted-foreground">
            {filteredMaterials.length} item
            {filteredMaterials.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="text-4xl">🔎</div>

              <h3 className="mt-4 text-lg font-semibold">
                No materials found
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Try changing your search or filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-sm">
                    <th className="px-5 py-4 font-medium">
                      Material
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Type
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Level
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Topic
                    </th>

                    <th className="px-5 py-4 font-medium">
                      File
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMaterials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <Link
                            href={`/materials/${material.id}`}
                            className="font-medium hover:underline"
                          >
                            {material.title}
                          </Link>

                          {material.description && (
                            <p className="mt-1 max-w-md truncate text-sm text-muted-foreground">
                              {material.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                          {getTypeLabel(material.type)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {material.level ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {material.topic ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="max-w-[220px] truncate text-sm font-medium">
                            {material.file_name ?? "No file"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {material.file_extension
                              ? material.file_extension.toUpperCase()
                              : material.mime_type ?? "—"}{" "}
                            · {formatFileSize(material.file_size)}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(material.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}