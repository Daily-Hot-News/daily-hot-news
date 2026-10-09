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
    <main>
      <header className="border-b border-zinc-200 bg-linear-to-br from-red-50 via-white to-blue-50">
        <div className="mx-auto max-w-4xl px-4 py-9 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Cari Berita
          </h1>
          <div className="mt-5">
            <SearchBar defaultValue={query} autoFocus={!query} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {results ? (
          <SearchResults
            query={query}
            results={results}
            hrefFor={(n) =>
              `/search?q=${encodeURIComponent(query)}${n === 1 ? "" : `&page=${n}`}`
            }
          />
        ) : (
          <div>
            <p className="text-sm text-zinc-600">
              Ketik kata kunci di atas untuk mulai mencari.
            </p>

            {popularTags.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3">
                  <span
                    className="h-6 w-1.5 rounded-full bg-linear-to-b from-blue-600 to-sky-500"
                    aria-hidden
                  />
                  <h2 className="font-serif text-xl font-bold text-zinc-900">
                    Topik populer
                  </h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
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
    </main>
  );
}
