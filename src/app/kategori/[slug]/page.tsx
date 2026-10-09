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
import { categoryAccent } from "@/lib/categoryAccent";
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
  const accent = categoryAccent(category.slug);

  return (
    <main>
      {/* Pita judul berwarna khas kategori ini. */}
      <header className={`bg-linear-to-r ${accent.gradient}`}>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-white/80"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Beranda
            </Link>
            <span aria-hidden>/</span>
            {category.parent && (
              <>
                <Link
                  href={`/kategori/${category.parent.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {category.parent.name}
                </Link>
                <span aria-hidden>/</span>
              </>
            )}
            <span className="font-medium text-white">{category.name}</span>
          </nav>

          <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {category.name}
          </h1>

          <p className="mt-2 text-sm font-medium text-white/90">
            {total} artikel tayang
          </p>

          {category.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">
              {category.description}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {category.children.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Sub-kategori
            </span>
            {category.children.map((child) => {
              const childAccent = categoryAccent(child.slug);
              return (
                <Link
                  key={child.id}
                  href={`/kategori/${child.slug}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-opacity hover:opacity-80 ${childAccent.badge}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${childAccent.dot}`}
                    aria-hidden
                  />
                  {child.name}
                </Link>
              );
            })}
          </div>
        )}

        {articles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
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
                n === 1 ? `/kategori/${slug}` : `/kategori/${slug}?page=${n}`
              }
            />
          </>
        )}
      </div>
    </main>
  );
}
