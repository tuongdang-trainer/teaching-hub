
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditVocabularyPage() {
  const params = useParams<{ vocabularyId: string }>();
  const router = useRouter();

  const vocabularyId = params.vocabularyId;

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!vocabularyId) return;

    let cancelled = false;

    async function loadVocabulary() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("vocabularies")
        .select(
          `
            id,
            word,
            meaning,
            part_of_speech,
            pronunciation,
            example_sentence,
            level,
            topic,
            notes
          `
        )
        .eq("id", vocabularyId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setErrorMessage(
          error?.message || "Vocabulary item could not be found."
        );
        setLoading(false);
        return;
      }

      setWord(data.word ?? "");
      setMeaning(data.meaning ?? "");
      setPartOfSpeech(data.part_of_speech ?? "");
      setPronunciation(data.pronunciation ?? "");
      setExampleSentence(data.example_sentence ?? "");
      setLevel(data.level ?? "");
      setTopic(data.topic ?? "");
      setNotes(data.notes ?? "");

      setLoading(false);
    }

    loadVocabulary();

    return () => {
      cancelled = true;
    };
  }, [vocabularyId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedWord = word.trim();

    if (!trimmedWord) {
      setErrorMessage("Word / Phrase is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("vocabularies")
      .update({
        word: trimmedWord,
        meaning: meaning.trim() || null,
        part_of_speech: partOfSpeech.trim() || null,
        pronunciation: pronunciation.trim() || null,
        example_sentence: exampleSentence.trim() || null,
        level: level.trim() || null,
        topic: topic.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", vocabularyId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/vocabulary/${vocabularyId}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc]">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-sm text-[#6b7280]">Loading vocabulary...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <Link
            href={`/vocabulary/${vocabularyId}`}
            className="text-sm text-[#6b7280] hover:text-[#111827]"
          >
            ← Back to Vocabulary Detail
          </Link>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
            Edit Vocabulary
          </h1>

          <p className="mt-1 text-sm text-[#6b7280]">
            Update this vocabulary item and save your changes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Word / Phrase"
              value={word}
              onChange={setWord}
              required
            />

            <Field
              label="Meaning"
              value={meaning}
              onChange={setMeaning}
            />

            <Field
              label="Part of Speech"
              value={partOfSpeech}
              onChange={setPartOfSpeech}
            />

            <Field
              label="Pronunciation"
              value={pronunciation}
              onChange={setPronunciation}
            />

            <Field
              label="Level"
              value={level}
              onChange={setLevel}
            />

            <Field
              label="Topic"
              value={topic}
              onChange={setTopic}
            />

            <div className="md:col-span-2">
              <TextAreaField
                label="Example Sentence"
                value={exampleSentence}
                onChange={setExampleSentence}
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <TextAreaField
                label="Notes"
                value={notes}
                onChange={setNotes}
                rows={5}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#e5e7eb] pt-6">
            <Link
              href={`/vocabulary/${vocabularyId}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#111827] transition hover:border-[#9ca3af] hover:bg-[#f9fafb]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#111827] px-5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
      />
    </div>
  );
}

