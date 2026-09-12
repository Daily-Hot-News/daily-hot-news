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
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-zinc-500 mb-2">
          <Link href="/" className="hover:underline">
            Beranda
          </Link>
          <span aria-hidden> / </span>
          <span className="text-zinc-700">Tag</span>
        </nav>

        <h1 className="text-3xl font-bold">#{tag.name}</h1>
        <p className="text-zinc-600 mt-2">
          {total} artikel dengan tag ini.
        </p>

        <hr className="my-6 border-zinc-200" />

        {articles.length === 0 ? (
          <p className="text-zinc-500">Belum ada artikel dengan tag ini.</p>
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
