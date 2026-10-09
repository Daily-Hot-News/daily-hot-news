import Link from "next/link";
import { getCategoryTree } from "@/features/category/queries";
import { getPopularTags } from "@/features/tag/queries";
import { TagPill } from "@/features/tag/components/TagPill";
import { SearchBar } from "@/features/search/components/SearchBar";
import { categoryAccent } from "@/lib/categoryAccent";
import { SITE_NAME } from "@/lib/site";

/**
 * TODO (Dev B): beranda ini masih placeholder. Isinya sengaja dibatasi pada
 * yang sudah menjadi milik slice Dev C - pencarian, navigasi kategori, dan tag
 * populer - supaya daftar artikel utama bisa dibangun di sini tanpa perlu
 * membongkar apa pun. Tempatnya: section bertanda "Headline" di bawah.
 *
 * Komponen yang siap dipakai ulang:
 *   <SearchBar />                      src/features/search/components/SearchBar.tsx
 *   <TagPill name slug count />        src/features/tag/components/TagPill.tsx
 *   <ArticleCard article={...} />      src/components/ArticleCard.tsx
 *   getCategoryTree()                  src/features/category/queries.ts
 *   categoryAccent(slug)               src/lib/categoryAccent.ts
 */
export default async function Home() {
  const [categories, popularTags] = await Promise.all([
    getCategoryTree(),
    getPopularTags(10),
  ]);

  return (
    <main>
      {/* Hero: latar putih dengan sapuan warna lembut, bukan blok gelap. */}
      <section className="border-b border-zinc-200 bg-linear-to-br from-red-50 via-white to-blue-50">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden />
            Kabar hari ini
          </span>

          <h1 className="mt-5 font-serif text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            {SITE_NAME}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
            Politik, ekonomi, teknologi, sampai olahraga - dirangkum singkat
            supaya kamu tetap terhubung dengan yang sedang hangat.
          </p>

          <div className="mt-8 flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Headline: slot daftar artikel utama milik Dev B. */}

        <section>
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-linear-to-b from-red-600 to-rose-500" />
            <h2 className="font-serif text-2xl font-bold text-zinc-900">
              Jelajahi Kategori
            </h2>
          </div>

          {categories.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
              Belum ada kategori.{" "}
              <Link
                href="/admin/categories"
                className="font-semibold text-blue-700 hover:underline"
              >
                Buat kategori pertama
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const accent = categoryAccent(category.slug);

                return (
                  <li
                    key={category.id}
                    className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-zinc-200/70"
                  >
                    <span
                      className={`block h-1.5 bg-linear-to-r ${accent.gradient}`}
                      aria-hidden
                    />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg font-bold text-zinc-900">
                          <Link
                            href={`/kategori/${category.slug}`}
                            className={`transition-colors ${accent.groupHoverText}`}
                          >
                            {category.name}
                          </Link>
                        </h3>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold tabular-nums ${accent.badge}`}
                        >
                          {category._count.articles}
                        </span>
                      </div>

                      {category.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                          {category.description}
                        </p>
                      )}

                      {category.children.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-1.5">
                          {category.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/kategori/${child.slug}`}
                                className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {popularTags.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1.5 rounded-full bg-linear-to-b from-blue-600 to-sky-500" />
              <h2 className="font-serif text-2xl font-bold text-zinc-900">
                Topik Populer
              </h2>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
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
