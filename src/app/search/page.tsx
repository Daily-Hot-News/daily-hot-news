import type { Metadata } from "next";
import { searchArticles } from "@/features/search/queries";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchResults } from "@/features/search/components/SearchResults";
import { getPopularTags } from "@/features/tag/queries";
import { TagPill } from "@/features/tag/components/TagPill";
import { PER_PAGE, parsePageParam, parseStringParam } from "@/lib/pagination";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const query = parseStringParam((await searchParams).q);

  return {
    title: query ? `Hasil pencarian: ${query}` : "Cari Berita",
    // Halaman hasil pencarian tidak layak di-index: isinya berubah-ubah dan
    // menghasilkan URL tak terbatas yang cuma membuang crawl budget.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const query = parseStringParam(resolved.q);
  const page = parsePageParam(resolved.page);

  const results = query
    ? await searchArticles({ q: query, page, perPage: PER_PAGE })
    : null;

  const popularTags = results ? [] : await getPopularTags(12);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cari Berita</h1>

        <SearchBar defaultValue={query} autoFocus={!query} />

        <div className="mt-8">
          {results ? (
            <SearchResults
              query={query}
              results={results}
              hrefFor={(n) =>
                `/search?q=${encodeURIComponent(query)}${n === 1 ? "" : `&page=${n}`}`
              }
            />
          ) : (
            <div className="text-zinc-600">
              <p>Ketik kata kunci di atas untuk mulai mencari.</p>

              {popularTags.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-medium text-zinc-500 mb-3">
                    Topik populer
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <TagPill
                        key={tag.id}
                        name={tag.name}
                        slug={tag.slug}
                        count={tag._count.articles}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
