import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type VocabularyItem = {
  id: string;
  word: string;
  meaning: string | null;
  part_of_speech: string | null;
  level: string | null;
  topic: string | null;
};

export default async function VocabularyPage() {
  const supabase = await createClient();

  const { data: vocabulary, error } = await supabase
    .from("vocabularies")
    .select(
      "id, word, meaning, part_of_speech, level, topic"
    )
    .order("word", { ascending: true });

  const items: VocabularyItem[] = vocabulary ?? [];

  const topics = new Set(
    items
      .map((item) => item.topic)
      .filter((topic): topic is string => Boolean(topic))
  );

  const levels = new Set(
    items
      .map((item) => item.level)
      .filter((level): level is string => Boolean(level))
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#6b7280]">
              Teaching Resources
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#111827]">
              Vocabulary Library
            </h1>

            <p className="mt-2 text-sm text-[#6b7280]">
              Build and reuse vocabulary resources across your lessons.
            </p>
          </div>

          <Link
            href="/vocabulary/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#111827] shadow-sm transition hover:border-[#9ca3af] hover:bg-[#f9fafb] active:bg-[#f3f4f6]"
          >
            <span className="text-lg font-light leading-none">+</span>
            <span>Create Vocabulary</span>
          </Link>
        </div>

        {error ? (
          <section className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Failed to load vocabulary.
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error.message}
            </p>
          </section>
        ) : null}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <KpiCard
            label="Total Vocabulary"
            value={items.length}
          />

          <KpiCard
            label="Topics"
            value={topics.size}
          />

          <KpiCard
            label="Levels"
            value={levels.size}
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="border-b border-[#e5e7eb] px-6 py-4">
            <h2 className="text-base font-semibold text-[#111827]">
              Vocabulary
            </h2>

            <p className="mt-1 text-sm text-[#6b7280]">
              Reusable vocabulary items available in Teaching Hub.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-[#374151]">
                No vocabulary items yet.
              </p>

              <p className="mt-1 text-sm text-[#6b7280]">
                Create your first vocabulary item to start building your
                library.
              </p>

              <Link
                href="/vocabulary/new"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937]"
              >
                Create Vocabulary
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e7eb]">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/vocabulary/${item.id}`}
                  className="block px-6 py-5 transition hover:bg-[#f9fafb]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-[#111827]">
                          {item.word}
                        </h3>

                        {item.part_of_speech ? (
                          <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-xs font-medium text-[#4b5563]">
                            {item.part_of_speech}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm text-[#6b7280]">
                        {item.meaning || "No meaning added yet."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                      {item.level ? (
                        <span className="rounded-full border border-[#e5e7eb] px-2.5 py-1">
                          {item.level}
                        </span>
                      ) : null}

                      {item.topic ? (
                        <span className="rounded-full border border-[#e5e7eb] px-2.5 py-1">
                          {item.topic}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#6b7280]">{label}</p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
    </div>
  );
}

