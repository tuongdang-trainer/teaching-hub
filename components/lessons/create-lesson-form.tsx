"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CreateLessonFormProps = {
  courseId: string;
  unitId: string;
};

export default function CreateLessonForm({
  courseId,
  unitId,
}: CreateLessonFormProps) {
  const router = useRouter();

  const [lessonNumber, setLessonNumber] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("60");
  const [objective, setObjective] = useState("");
  const [languageFocus, setLanguageFocus] = useState("");
  const [vocabularyFocus, setVocabularyFocus] = useState("");
  const [skillFocus, setSkillFocus] = useState("");
  const [status, setStatus] = useState("draft");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Lesson title is required.");
      return;
    }

    const parsedLessonNumber = lessonNumber.trim()
      ? Number(lessonNumber)
      : null;

    if (
      parsedLessonNumber !== null &&
      (!Number.isInteger(parsedLessonNumber) ||
        parsedLessonNumber < 1)
    ) {
      setError(
        "Lesson number must be a positive whole number."
      );
      return;
    }

    const parsedDuration = duration.trim()
      ? Number(duration)
      : null;

    if (
      parsedDuration !== null &&
      (!Number.isInteger(parsedDuration) ||
        parsedDuration <= 0)
    ) {
      setError(
        "Duration must be a positive whole number."
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(
        "You must be signed in to create a lesson."
      );
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        unit_id: unitId,
        teacher_id: user.id,
        lesson_number: parsedLessonNumber,
        title: title.trim(),
        topic: topic.trim() || null,
        duration: parsedDuration,
        objective: objective.trim() || null,
        language_focus: languageFocus.trim() || null,
        vocabulary_focus:
          vocabularyFocus.trim() || null,
        skill_focus: skillFocus.trim() || null,
        status,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLessonNumber("");
    setTitle("");
    setTopic("");
    setDuration("60");
    setObjective("");
    setLanguageFocus("");
    setVocabularyFocus("");
    setSkillFocus("");
    setStatus("draft");

    setSuccess("Lesson created successfully.");
    setLoading(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Add Lesson
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Create a lesson and define its basic teaching
          information.
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

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Lesson Number */}
        <div>
          <label
            htmlFor="lessonNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Lesson Number
          </label>

          <input
            id="lessonNumber"
            type="number"
            min="1"
            value={lessonNumber}
            onChange={(event) =>
              setLessonNumber(event.target.value)
            }
            placeholder="1"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700"
          >
            Duration (minutes)
          </label>

          <input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(event) =>
              setDuration(event.target.value)
            }
            placeholder="60"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Lesson Title *
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="e.g. Ask and Give Information"
          required
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Topic */}
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-gray-700"
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
          placeholder="e.g. Personal information"
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Objective */}
      <div>
        <label
          htmlFor="objective"
          className="block text-sm font-medium text-gray-700"
        >
          Learning Objective
        </label>

        <textarea
          id="objective"
          value={objective}
          onChange={(event) =>
            setObjective(event.target.value)
          }
          rows={3}
          placeholder="What should learners be able to do by the end of the lesson?"
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Language Focus */}
        <div>
          <label
            htmlFor="languageFocus"
            className="block text-sm font-medium text-gray-700"
          >
            Language Focus
          </label>

          <input
            id="languageFocus"
            type="text"
            value={languageFocus}
            onChange={(event) =>
              setLanguageFocus(event.target.value)
            }
            placeholder="e.g. What is your...?"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Vocabulary Focus */}
        <div>
          <label
            htmlFor="vocabularyFocus"
            className="block text-sm font-medium text-gray-700"
          >
            Vocabulary Focus
          </label>

          <input
            id="vocabularyFocus"
            type="text"
            value={vocabularyFocus}
            onChange={(event) =>
              setVocabularyFocus(event.target.value)
            }
            placeholder="e.g. name, address, occupation"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Skill Focus */}
      <div>
        <label
          htmlFor="skillFocus"
          className="block text-sm font-medium text-gray-700"
        >
          Skill Focus
        </label>

        <input
          id="skillFocus"
          type="text"
          value={skillFocus}
          onChange={(event) =>
            setSkillFocus(event.target.value)
          }
          placeholder="e.g. Speaking"
          className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>

        <select
          id="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        >
          <option value="draft">Draft</option>
          <option value="planned">Planned</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Lesson"}
        </button>
      </div>
    </form>
  );
}