"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CreateVocabularyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedWord = word.trim();

    if (!trimmedWord) {
      setError("Word / Phrase is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        return;
      }

      console.log(
  "AUTH DEBUG:",
  "userId=" + user?.id,
  "email=" + user?.email
);

const {
  data: { session },
} = await supabase.auth.getSession();

console.log(
  "SESSION DEBUG:",
  "userId=" + (session?.user?.id ?? "null"),
  "role=" + (session?.user?.role ?? "null"),
  "hasAccessToken=" + String(Boolean(session?.access_token))
);

      if (!user) {
        setError("You must be signed in to create vocabulary.");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("vocabularies")
        .insert({
          word: trimmedWord,
          meaning: meaning.trim() || null,
          part_of_speech: partOfSpeech.trim() || null,
          pronunciation: pronunciation.trim() || null,
          example_sentence: exampleSentence.trim() || null,
          level: level.trim() || null,
          topic: topic.trim() || null,
          notes: notes.trim() || null,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Vocabulary insert error:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });

        setError(
          insertError.message || "Failed to create vocabulary."
        );

        return;
      }

      if (!data?.id) {
        setError(
          "Vocabulary was created, but no vocabulary ID was returned."
        );
        return;
      }

      router.push(`/vocabulary/${data.id}`);
    } catch (submitError) {
      console.error("Unexpected vocabulary error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create vocabulary. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/vocabulary"
          className="inline-flex items-center text-sm font-medium text-[#6b7280] transition hover:text-[#111827]"
        >
          ← Back to Vocabulary
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-[#6b7280]">
            Teaching Hub
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
            Create Vocabulary
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Add a reusable vocabulary item to your teaching library.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-6 py-5">
            <h2 className="text-base font-semibold text-[#111827]">
              Vocabulary Information
            </h2>

            <p className="mt-1 text-sm text-[#6b7280]">
              Enter the core information for this vocabulary item.
            </p>
          </div>

          <div className="grid gap-5 px-6 py-6">
            <div>
              <label
                htmlFor="word"
                className="block text-sm font-medium text-[#374151]"
              >
                Word / Phrase <span className="text-[#b42318]">*</span>
              </label>

              <input
                id="word"
                type="text"
                value={word}
                onChange={(event) => setWord(event.target.value)}
                placeholder="e.g. make a decision"
                className="mt-2 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="meaning"
                className="block text-sm font-medium text-[#374151]"
              >
                Meaning
              </label>

              <textarea
                id="meaning"
                value={meaning}
                onChange={(event) => setMeaning(event.target.value)}
                placeholder="Enter the meaning or definition"
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                disabled={saving}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="part-of-speech"
                  className="block text-sm font-medium text-[#374151]"
                >
                  Part of Speech
                </label>

                <input
                  id="part-of-speech"
                  type="text"
                  value={partOfSpeech}
                  onChange={(event) => setPartOfSpeech(event.target.value)}
                  placeholder="e.g. verb"
                  className="mt-2 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="pronunciation"
                  className="block text-sm font-medium text-[#374151]"
                >
                  Pronunciation
                </label>

                <input
                  id="pronunciation"
                  type="text"
                  value={pronunciation}
                  onChange={(event) => setPronunciation(event.target.value)}
                  placeholder="e.g. məˈkeɪ ə dɪˈsɪʒən"
                  className="mt-2 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-6 py-5">
            <h2 className="text-base font-semibold text-[#111827]">
              Usage & Classification
            </h2>

            <p className="mt-1 text-sm text-[#6b7280]">
              Add information that helps you organize and use the vocabulary.
            </p>
          </div>

          <div className="grid gap-5 px-6 py-6">
            <div>
              <label
                htmlFor="example-sentence"
                className="block text-sm font-medium text-[#374151]"
              >
                Example Sentence
              </label>

              <textarea
                id="example-sentence"
                value={exampleSentence}
                onChange={(event) =>
                  setExampleSentence(event.target.value)
                }
                placeholder="e.g. We need to make a decision by Friday."
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                disabled={saving}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-[#374151]"
                >
                  Level
                </label>

                <input
                  id="level"
                  type="text"
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  placeholder="e.g. English 1"
                  className="mt-2 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-[#374151]"
                >
                  Topic
                </label>

                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Business Communication"
                  className="mt-2 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-[#374151]"
              >
                Notes
              </label>

              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional teacher notes"
                rows={4}
                className="mt-2 w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6b7280] focus:ring-2 focus:ring-[#e5e7eb]"
                disabled={saving}
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-[#f3c7c2] bg-[#fff8f7] px-4 py-3">
            <p className="text-sm font-medium text-[#b42318]">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/vocabulary"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#111827] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Vocabulary"}
          </button>
        </div>
      </form>
    </main>
  );
}