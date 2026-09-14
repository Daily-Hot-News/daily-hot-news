import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategoryBySlug,
  getArticlesByCategorySlug,
} from "@/features/category/queries";
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
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "Kategori tidak ditemukan" };

  const description =
    category.description ?? `Kumpulan berita terbaru kategori ${category.name}.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: absoluteUrl(`/kategori/${category.slug}`) },
    openGraph: {
      title: category.name,
      description,
      url: absoluteUrl(`/kategori/${category.slug}`),
      type: "website",
    },
  };
}

export default async function CategoryArchivePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = parsePageParam((await searchParams).page);
  const { articles, total } = await getArticlesByCategorySlug({
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
          {category.parent && (
            <>
              <Link
                href={`/kategori/${category.parent.slug}`}
                className="hover:underline"
              >
                {category.parent.name}
              </Link>
              <span aria-hidden> / </span>
            </>
          )}
          <span className="text-zinc-700">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-zinc-600 mt-2">{category.description}</p>
        )}

        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/kategori/${child.slug}`}
                className="px-3 py-1 text-sm border border-zinc-300 rounded-full hover:bg-zinc-100"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        <hr className="my-6 border-zinc-200" />

        {articles.length === 0 ? (
          <p className="text-zinc-500">
            Belum ada artikel di kategori ini.
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
                n === 1
                  ? `/kategori/${slug}`
                  : `/kategori/${slug}?page=${n}`
              }
            />
          </>
        )}
      </div>
    </main>
  );
}
