
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type VocabularyDetailPageProps = {
  params: Promise<{
    vocabularyId: string;
  }>;
};

export default async function VocabularyDetailPage({
  params,
}: VocabularyDetailPageProps) {
  const { vocabularyId } = await params;

  const supabase = await createClient();

  const { data: vocabulary, error } = await supabase
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
        notes,
        created_at,
        updated_at
      `
    )
    .eq("id", vocabularyId)
    .single();

  if (error || !vocabulary) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/vocabulary"
              className="text-sm text-[#6b7280] hover:text-[#111827]"
            >
              ← Back to Vocabulary Library
            </Link>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#111827]">
              Vocabulary Detail
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/vocabulary/${vocabulary.id}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#111827] shadow-sm transition hover:border-[#9ca3af] hover:bg-[#f9fafb]"
            >
              Edit
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium text-[#6b7280]">Word / Phrase</p>

            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#111827]">
              {vocabulary.word}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <DetailItem label="Meaning" value={vocabulary.meaning} />

            <DetailItem
              label="Part of Speech"
              value={vocabulary.part_of_speech}
            />

            <DetailItem
              label="Pronunciation"
              value={vocabulary.pronunciation}
            />

            <DetailItem label="Level" value={vocabulary.level} />

            <DetailItem label="Topic" value={vocabulary.topic} />

            <DetailItem
              label="Example Sentence"
              value={vocabulary.example_sentence}
            />

            <div className="md:col-span-2">
              <DetailItem label="Notes" value={vocabulary.notes} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#9ca3af]">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#374151]">
        {value || "—"}
      </p>
    </div>
  );
}

