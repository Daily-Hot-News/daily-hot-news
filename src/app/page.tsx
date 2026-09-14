import Link from "next/link";
import { getCategoryTree } from "@/features/category/queries";
import { getPopularTags } from "@/features/tag/queries";
import { TagPill } from "@/features/tag/components/TagPill";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SITE_NAME } from "@/lib/site";

/**
 * TODO (Dev B): beranda ini masih placeholder. Isinya sengaja dibatasi pada
 * yang sudah menjadi milik slice Dev C - pencarian, navigasi kategori, dan tag
 * populer - supaya daftar artikel utama bisa dibangun di sini tanpa perlu
 * membongkar apa pun.
 *
 * Komponen yang siap dipakai ulang:
 *   <SearchBar />                      src/features/search/components/SearchBar.tsx
 *   <TagPill name slug count />        src/features/tag/components/TagPill.tsx
 *   <ArticleCard article={...} />      src/components/ArticleCard.tsx
 *   getCategoryTree()                  src/features/category/queries.ts
 */
export default async function Home() {
  const [categories, popularTags] = await Promise.all([
    getCategoryTree(),
    getPopularTags(10),
  ]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{SITE_NAME}</h1>
          <SearchBar />
        </header>

        <section>
          <h2 className="text-lg font-semibold mb-3">Kategori</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Belum ada kategori.{" "}
              <Link
                href="/admin/categories"
                className="text-blue-600 hover:underline"
              >
                Buat kategori pertama
              </Link>
              .
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/kategori/${category.slug}`}
                    className="font-medium hover:underline"
                  >
                    {category.name}
                  </Link>
                  <span className="ml-2 text-xs text-zinc-500 tabular-nums">
                    {category._count.articles} artikel
                  </span>

                  {category.children.length > 0 && (
                    <ul className="ml-4 mt-1 flex flex-wrap gap-x-3 text-sm text-zinc-600">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/kategori/${child.slug}`}
                            className="hover:underline"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {popularTags.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Topik Populer</h2>
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
          </section>
        )}
      </div>
    </main>
  );
}
