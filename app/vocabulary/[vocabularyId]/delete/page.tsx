import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DeleteVocabularyPageProps = {
  params: Promise<{
    vocabularyId: string;
  }>;
};

export default async function DeleteVocabularyPage({
  params,
}: DeleteVocabularyPageProps) {
  const { vocabularyId } = await params;

  const supabase = await createClient();

  const { data: vocabulary, error: vocabularyError } = await supabase
    .from("vocabularies")
    .select("id, word, meaning")
    .eq("id", vocabularyId)
    .single();

  if (vocabularyError || !vocabulary) {
    return (
      <main className="min-h-screen bg-[#f8fafc] p-6">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Vocabulary not found
          </h1>

          <p className="mt-2 text-sm text-red-700">
            The vocabulary item you are trying to delete could not
            be found.
          </p>

          <Link
            href="/vocabulary"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937]"
          >
            Back to Vocabulary
          </Link>
        </div>
      </main>
    );
  }

  async function deleteVocabulary() {
    "use server";

    const supabase = await createClient();

    // Remove lesson associations first.
    const { error: lessonVocabularyError } = await supabase
      .from("lesson_vocabularies")
      .delete()
      .eq("vocabulary_id", vocabularyId);

    if (lessonVocabularyError) {
      redirect(
        `/vocabulary/${vocabularyId}/delete?error=${encodeURIComponent(
          lessonVocabularyError.message
        )}`
      );
    }

    // Delete the vocabulary item.
    const { error: deleteError } = await supabase
      .from("vocabularies")
      .delete()
      .eq("id", vocabularyId);

    if (deleteError) {
      redirect(
        `/vocabulary/${vocabularyId}/delete?error=${encodeURIComponent(
          deleteError.message
        )}`
      );
    }

    redirect("/vocabulary");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] p-6">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              !
            </div>

            <h1 className="text-xl font-semibold text-[#111827]">
              Delete Vocabulary
            </h1>

            <p className="mt-2 text-sm text-[#6b7280]">
              Are you sure you want to delete this vocabulary item?
              This action cannot be undone.
            </p>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="font-semibold text-[#111827]">
              {vocabulary.word}
            </p>

            {vocabulary.meaning ? (
              <p className="mt-1 text-sm text-[#6b7280]">
                {vocabulary.meaning}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Link
              href="/vocabulary"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]"
            >
              Cancel
            </Link>

            <form action={deleteVocabulary}>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete Vocabulary
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}