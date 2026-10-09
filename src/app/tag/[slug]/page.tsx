import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTagBySlug, getArticlesByTagSlug } from "@/features/tag/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { PER_PAGE, parsePageParam } from "@/lib/pagination";
import { absoluteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) return { title: "Tag tidak ditemukan" };

  const description = `Kumpulan berita dengan tag ${tag.name}.`;

  return {
    title: `#${tag.name}`,
    description,
    alternates: { canonical: absoluteUrl(`/tag/${tag.slug}`) },
    openGraph: {
      title: `#${tag.name}`,
      description,
      url: absoluteUrl(`/tag/${tag.slug}`),
      type: "website",
    },
  };
}

export default async function TagArchivePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const page = parsePageParam((await searchParams).page);
  const { articles, total } = await getArticlesByTagSlug({
    slug,
    page,
    perPage: PER_PAGE,
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main>
      {/* Tag pakai aksen biru - sengaja dibedakan dari pita kategori. */}
      <header className="border-b border-zinc-200 bg-linear-to-br from-blue-50 via-white to-sky-50">
        <div className="mx-auto max-w-4xl px-4 py-9 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-zinc-500"
          >
            <Link href="/" className="transition-colors hover:text-blue-700">
              Beranda
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-zinc-700">Tag</span>
          </nav>

          <h1 className="mt-3 flex flex-wrap items-center gap-3 font-serif text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 text-xl font-bold text-white shadow-sm">
              #
            </span>
            {tag.name}
          </h1>

          <p className="mt-2 text-sm font-medium text-zinc-600">
            {total} artikel dengan tag ini.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
            Belum ada artikel dengan tag ini.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(n) =>
                n === 1 ? `/tag/${slug}` : `/tag/${slug}?page=${n}`
              }
            />
          </>
        )}
      </div>
    </main>
  );
}
