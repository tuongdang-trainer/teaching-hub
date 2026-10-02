"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Learner = {
  id: string;
  full_name: string;
  email: string | null;
  current_level: string | null;
};

type AddLearnerButtonProps = {
  classId: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function formatLevel(value: string | null) {
  if (!value) return "Level not assigned";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AddLearnerButton({
  classId,
}: AddLearnerButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLearnerId, setSelectedLearnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadLearners() {
      setLoadingLearners(true);
      setError("");

      const { data, error: learnersError } = await supabase
        .from("learners")
        .select("id, full_name, email, current_level")
        .eq("status", "active")
        .order("full_name");

      if (learnersError) {
        setError(learnersError.message);
        setLoadingLearners(false);
        return;
      }

      setLearners((data ?? []) as Learner[]);
      setLoadingLearners(false);
    }

    loadLearners();
  }, [open, supabase]);

  const filteredLearners = learners.filter((learner) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      learner.full_name.toLowerCase().includes(searchValue) ||
      (learner.email || "").toLowerCase().includes(searchValue)
    );
  });

  const selectedLearner = learners.find(
    (learner) => learner.id === selectedLearnerId
  );

  async function handleEnroll() {
    if (!selectedLearnerId) {
      setError("Please select a learner.");
      return;
    }

    setLoading(true);
    setError("");

    const { data: existingEnrollment, error: existingError } =
      await supabase
        .from("class_enrollments")
        .select("id, status")
        .eq("class_id", classId)
        .eq("learner_id", selectedLearnerId)
        .maybeSingle();

    if (existingError) {
      setError(existingError.message);
      setLoading(false);
      return;
    }

    if (existingEnrollment?.status === "active") {
      setError("This learner is already enrolled in this class.");
      setLoading(false);
      return;
    }

    if (existingEnrollment) {
      const { error: updateError } = await supabase
        .from("class_enrollments")
        .update({
          status: "active",
          left_at: null,
        })
        .eq("id", existingEnrollment.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("class_enrollments")
        .insert({
          class_id: classId,
          learner_id: selectedLearnerId,
          status: "active",
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    setOpen(false);
    setSearch("");
    setSelectedLearnerId("");
    setLoading(false);

    router.refresh();
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setOpen(false);
    setSearch("");
    setSelectedLearnerId("");
    setError("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
        }}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition hover:opacity-90"
      >
        + Add Learner
      </button>

      {open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
    <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-white text-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Add Learner
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select an active learner to enroll in this class.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="border-b px-6 py-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-foreground focus:ring-1 focus:ring-foreground"
                  autoFocus
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {filteredLearners.length} active learner
                  {filteredLearners.length === 1 ? "" : "s"} available
                </p>

                {selectedLearner && (
                  <p className="text-xs font-medium text-foreground">
                    1 learner selected
                  </p>
                )}
              </div>
            </div>

            {/* Learner list */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {loadingLearners ? (
                <div className="flex min-h-40 items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Loading learners...
                  </p>
                </div>
              ) : filteredLearners.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
                  <p className="font-medium">
                    No learners found
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different name or email.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLearners.map((learner) => {
                    const isSelected =
                      selectedLearnerId === learner.id;

                    return (
                      <button
                        key={learner.id}
                        type="button"
                        onClick={() =>
                          setSelectedLearnerId(learner.id)
                        }
                        className={
                          isSelected
                            ? "flex w-full items-center gap-3 rounded-xl border border-foreground bg-muted/60 px-4 py-3 text-left transition"
                            : "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition hover:bg-muted/40"
                        }
                      >
                        {/* Initials */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {getInitials(learner.full_name)}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {learner.full_name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {learner.email || "No email"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatLevel(learner.current_level)}
                          </p>
                        </div>

                        {/* Selection */}
                        <div
                          className={
                            isSelected
                              ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-xs text-background"
                              : "h-5 w-5 shrink-0 rounded-full border"
                          }
                        >
                          {isSelected ? "✓" : ""}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
              <div className="min-w-0">
                {selectedLearner ? (
                  <p className="truncate text-sm">
                    <span className="text-muted-foreground">
                      Selected:
                    </span>{" "}
                    <span className="font-medium">
                      {selectedLearner.full_name}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No learner selected
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={!selectedLearnerId || loading}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Enrolling..." : "Enroll Learner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}