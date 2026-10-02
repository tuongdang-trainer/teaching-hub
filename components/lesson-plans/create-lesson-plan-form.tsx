"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateLessonPlanFormProps = {
  lessonId: string;
};

export default function CreateLessonPlanForm({
  lessonId,
}: CreateLessonPlanFormProps) {
  const router = useRouter();

  const [opening, setOpening] = useState("");
  const [presentation, setPresentation] = useState("");
  const [guidedPractice, setGuidedPractice] = useState("");
  const [generalPractice, setGeneralPractice] = useState("");
  const [performance, setPerformance] = useState("");
  const [retry, setRetry] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [learnerNotes, setLearnerNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to create a lesson plan.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("lesson_plans")
      .insert({
        lesson_id: lessonId,
        opening: opening.trim() || null,
        presentation: presentation.trim() || null,
        guided_practice: guidedPractice.trim() || null,
        general_practice: generalPractice.trim() || null,
        performance: performance.trim() || null,
        retry: retry.trim() || null,
        teacher_notes: teacherNotes.trim() || null,
        learner_notes: learnerNotes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess("Lesson plan created successfully.");
    setLoading(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Create Lesson Plan
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Build the teaching flow for this lesson.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Opening */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            1. Opening
          </h4>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Set the context, activate prior knowledge, and introduce
            the lesson mission.
          </p>
        </div>

        <textarea
          value={opening}
          onChange={(event) =>
            setOpening(event.target.value)
          }
          rows={4}
          placeholder="e.g. Welcome learners, introduce the situation, establish the communication goal..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Presentation */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            2. Presentation
          </h4>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Introduce the target language and model the communication
            needed for the lesson.
          </p>
        </div>

        <textarea
          value={presentation}
          onChange={(event) =>
            setPresentation(event.target.value)
          }
          rows={5}
          placeholder="e.g. Present key language through questions, examples, gestures, visuals, or a short model conversation..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Guided Practice */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            3. Guided Practice
          </h4>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Give learners structured practice with enough support to
            use the target language successfully.
          </p>
        </div>

        <textarea
          value={guidedPractice}
          onChange={(event) =>
            setGuidedPractice(event.target.value)
          }
          rows={5}
          placeholder="e.g. Controlled questions, substitution practice, prompts, pair practice, information gaps..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* General Practice */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            4. General Practice
          </h4>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Move learners toward more spontaneous communication and
            less teacher support.
          </p>
        </div>

        <textarea
          value={generalPractice}
          onChange={(event) =>
            setGeneralPractice(event.target.value)
          }
          rows={5}
          placeholder="e.g. Personalised questions, role-play, pair exchange, changing information, real-life situations..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Performance */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            5. Performance
          </h4>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Give learners a communication task where they must use
            the target language to achieve a meaningful outcome.
          </p>
        </div>

        <textarea
          value={performance}
          onChange={(event) =>
            setPerformance(event.target.value)
          }
          rows={5}
          placeholder="e.g. Learner completes a real-world communication mission with minimal teacher intervention..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Retry */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900">
            6. Retry
          </h4>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Re-run or adapt the performance task so learners can
            improve after feedback.
          </p>
        </div>

        <textarea
          value={retry}
          onChange={(event) =>
            setRetry(event.target.value)
          }
          rows={5}
          placeholder="e.g. Repeat the task with a new situation, new partner, new information, or increased challenge..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Notes */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Teacher Notes
            </h4>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Private notes for teaching preparation or delivery.
            </p>
          </div>

          <textarea
            value={teacherNotes}
            onChange={(event) =>
              setTeacherNotes(event.target.value)
            }
            rows={5}
            placeholder="Teaching reminders, anticipated difficulties, timing..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Learner Notes
            </h4>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Notes about learner needs or expected support.
            </p>
          </div>

          <textarea
            value={learnerNotes}
            onChange={(event) =>
              setLearnerNotes(event.target.value)
            }
            rows={5}
            placeholder="Learner needs, common errors, individual support..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Lesson Plan"}
        </button>
      </div>
    </form>
  );
}