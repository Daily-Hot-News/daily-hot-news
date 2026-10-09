import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/features/article/queries";
import { formatArticleDate } from "@/components/ArticleCard";
import { TagPill } from "@/features/tag/components/TagPill";
import { categoryAccent } from "@/lib/categoryAccent";
import { absoluteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) return { title: "Artikel tidak ditemukan" };

  const title = article.metaTitle ?? article.title;
  const description = article.metaDescription ?? article.excerpt ?? undefined;
  const url = absoluteUrl(`/artikel/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.featuredImage ? [article.featuredImage.url] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles({
    articleId: article.id,
    categorySlug: article.category.slug,
  });

  const authorName =
    article.author.authorProfile?.displayName ?? article.author.name;
  const accent = categoryAccent(article.category.slug);

  // Content disimpan sebagai teks biasa. Dipecah per baris kosong jadi paragraf,
  // dan sengaja TIDAK lewat dangerouslySetInnerHTML - isi artikel datang dari
  // form admin, jadi memperlakukannya sebagai HTML membuka celah XSS.
  const paragraphs = article.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <article>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-zinc-500"
        >
          <Link href="/" className="transition-colors hover:text-red-600">
            Beranda
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/kategori/${article.category.slug}`}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80 ${accent.badge}`}
          >
            {article.category.name}
          </Link>
        </nav>

        <h1 className="mt-4 font-serif text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
          {article.title}
        </h1>

        {/* Baris penulis + tanggal */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-zinc-200 py-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold uppercase text-white ${accent.gradient}`}
            aria-hidden
          >
            {authorName.charAt(0)}
          </span>
          <div className="min-w-0 text-sm">
            {article.author.authorProfile ? (
              <Link
                href={`/authors/${article.author.authorProfile.slug}`}
                className="font-semibold text-zinc-900 transition-colors hover:text-red-700"
              >
                {authorName}
              </Link>
            ) : (
              <span className="font-semibold text-zinc-900">{authorName}</span>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              {article.author.authorProfile?.jobTitle && (
                <>
                  <span>{article.author.authorProfile.jobTitle}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              {article.publishedAt && (
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatArticleDate(article.publishedAt)}
                </time>
              )}
            </div>
          </div>
        </div>

        {article.featuredImage && (
          <figure className="mt-6">
            {/* Host Supabase Storage sudah terdaftar di images.remotePatterns,
                jadi next/image sebenarnya bisa dipakai di sini. Masih <img>
                karena next/image butuh width/height (atau `fill`), sementara
                baris Media lama bisa jadi belum punya dimensinya. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.featuredImage.url}
              alt={article.featuredImage.altText ?? ""}
              className="w-full rounded-xl bg-zinc-100 object-cover shadow-sm"
            />
            {article.featuredImage.caption && (
              <figcaption className="mt-2 border-l-2 border-zinc-300 pl-3 text-xs text-zinc-500">
                {article.featuredImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        {article.excerpt && (
          <p
            className={`mt-7 border-l-4 py-1 pl-4 text-lg font-medium leading-relaxed text-zinc-700 ${accent.border}`}
          >
            {article.excerpt}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-5 text-[17px] leading-[1.8] text-zinc-800">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>

        {article.tags.length > 0 && (
          <div className="mt-10 border-t border-zinc-200 pt-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Tag terkait
            </h2>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(({ tag }) => (
                <TagPill key={tag.slug} name={tag.name} slug={tag.slug} />
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <span
                className={`h-6 w-1.5 rounded-full bg-linear-to-b ${accent.gradient}`}
                aria-hidden
              />
              <h2 className="font-serif text-xl font-bold text-zinc-900">
                Lainnya di {article.category.name}
              </h2>
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/artikel/${item.slug}`}
                    className="group flex h-full items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accent.dot}`}
                      aria-hidden
                    />
                    <span
                      className={`font-serif text-sm font-semibold leading-snug text-zinc-800 transition-colors ${accent.groupHoverText}`}
                    >
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
