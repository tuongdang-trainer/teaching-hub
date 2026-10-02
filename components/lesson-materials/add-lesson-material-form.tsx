"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Material = {
  id: string;
  title: string;
  type: string;
  file_name: string | null;
  level: string | null;
  topic: string | null;
};

type AddLessonMaterialFormProps = {
  lessonId: string;
  assignedMaterialIds: string[];
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

export default function AddLessonMaterialForm({
  lessonId,
  assignedMaterialIds,
}: AddLessonMaterialFormProps) {
  const supabase = createClient();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadMaterials() {
      setLoading(true);
      setError("");

      const { data, error: materialsError } = await supabase
        .from("materials")
        .select(
          "id, title, type, file_name, level, topic"
        )
        .eq("status", "active")
        .order("title", { ascending: true });

      if (materialsError) {
        console.error(
          "Failed to load materials:",
          materialsError
        );
        setError(materialsError.message);
        setMaterials([]);
      } else {
        setMaterials((data ?? []) as Material[]);
      }

      setLoading(false);
    }

    loadMaterials();
  }, [supabase]);

  const availableMaterials = materials.filter(
    (material) => !assignedMaterialIds.includes(material.id)
  );

  async function handleAddMaterial() {
    if (!selectedMaterialId) {
      setError("Please select a material.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error: insertError } = await supabase
      .from("lesson_materials")
      .insert({
        lesson_id: lessonId,
        material_id: selectedMaterialId,
      });

    if (insertError) {
      console.error(
        "Failed to assign material:",
        insertError
      );
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSelectedMaterialId("");
    setSuccess("Material added to this lesson.");
    setSaving(false);

    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedMaterialId}
          onChange={(event) =>
            setSelectedMaterialId(event.target.value)
          }
          disabled={loading || saving}
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-black disabled:bg-gray-100"
        >
          <option value="">
            {loading
              ? "Loading materials..."
              : availableMaterials.length === 0
                ? "No available materials"
                : "Select a material"}
          </option>

          {availableMaterials.map((material) => (
            <option
              key={material.id}
              value={material.id}
            >
              {material.title}
              {material.level
                ? ` — ${material.level}`
                : ""}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAddMaterial}
          disabled={
            loading ||
            saving ||
            !selectedMaterialId
          }
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Material"}
        </button>
      </div>

      {selectedMaterialId && (
        <div className="rounded-lg bg-gray-50 p-4">
          {(() => {
            const selectedMaterial = materials.find(
              (material) =>
                material.id === selectedMaterialId
            );

            if (!selectedMaterial) {
              return null;
            }

            return (
              <div>
                <p className="font-medium">
                  {selectedMaterial.title}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {getTypeLabel(selectedMaterial.type)}
                  {selectedMaterial.level
                    ? ` · ${selectedMaterial.level}`
                    : ""}
                  {selectedMaterial.topic
                    ? ` · ${selectedMaterial.topic}`
                    : ""}
                </p>

                {selectedMaterial.file_name && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedMaterial.file_name}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

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
    </div>
  );
}