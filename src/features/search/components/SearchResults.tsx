import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { splitHighlights } from "../highlight";
import type { SearchResponse } from "../types";

type SearchResultsProps = {
  query: string;
  results: SearchResponse;
  /** Bangun URL halaman ke-n, dengan query pencarian tetap terbawa. */
  hrefFor: (page: number) => string;
};

export function SearchResults({
  query,
  results,
  hrefFor,
}: SearchResultsProps) {
  if (results.total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
        </div>
        <p className="text-zinc-800">
          Tidak ada artikel yang cocok dengan{" "}
          <span className="font-semibold">&ldquo;{query}&rdquo;</span>.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Coba kata kunci yang lebih umum, atau periksa ejaannya.
        </p>
      </div>
    );
  }

  const from = (results.page - 1) * results.perPage + 1;
  const to = Math.min(results.page * results.perPage, results.total);

  return (
    <div>
      <p className="mb-5 text-sm text-zinc-500">
        Menampilkan {from}&ndash;{to} dari{" "}
        <span className="font-semibold tabular-nums text-zinc-700">
          {results.total}
        </span>{" "}
        hasil untuk{" "}
        <span className="font-semibold text-zinc-700">
          &ldquo;{query}&rdquo;
        </span>
      </p>

      <div className="flex flex-col gap-4">
        {results.hits.map((hit) => (
          <ArticleCard key={hit.id} article={hit}>
            {splitHighlights(hit.headline).map((segment, index) =>
              segment.match ? (
                <mark
                  key={index}
                  className="rounded bg-amber-200/70 px-0.5 font-medium text-zinc-900"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </ArticleCard>
        ))}
      </div>

      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        hrefFor={hrefFor}
      />
    </div>
  );
}
