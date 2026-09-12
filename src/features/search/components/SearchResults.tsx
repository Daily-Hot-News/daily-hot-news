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
      <div className="border border-zinc-200 rounded-lg p-8 text-center">
        <p className="text-zinc-700">
          Tidak ada artikel yang cocok dengan{" "}
          <span className="font-semibold">&ldquo;{query}&rdquo;</span>.
        </p>
        <p className="text-sm text-zinc-500 mt-2">
          Coba kata kunci yang lebih umum, atau periksa ejaannya.
        </p>
      </div>
    );
  }

  const from = (results.page - 1) * results.perPage + 1;
  const to = Math.min(results.page * results.perPage, results.total);

  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        Menampilkan {from}&ndash;{to} dari {results.total} hasil untuk{" "}
        <span className="font-semibold text-zinc-700">
          &ldquo;{query}&rdquo;
        </span>
      </p>

      <div className="flex flex-col gap-4">
        {results.hits.map((hit) => (
          <ArticleCard key={hit.id} article={hit}>
            {splitHighlights(hit.headline).map((segment, index) =>
              segment.match ? (
                <mark key={index} className="bg-yellow-200 text-inherit">
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
