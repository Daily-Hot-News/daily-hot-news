import Link from "next/link";
import type { ArticleCardData } from "@/lib/articleCard";
import { categoryAccent } from "@/lib/categoryAccent";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatArticleDate(date: Date | null): string {
  return date ? dateFormatter.format(date) : "";
}

type ArticleCardProps = {
  article: ArticleCardData;
  /** Cuplikan khusus (mis. hasil pencarian ber-highlight) menggantikan excerpt. */
  children?: React.ReactNode;
};

export function ArticleCard({ article, children }: ArticleCardProps) {
  const authorName =
    article.author.authorProfile?.displayName ?? article.author.name;
  const accent = categoryAccent(article.category.slug);

  return (
    <article className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 pl-5 transition-shadow hover:shadow-lg hover:shadow-zinc-200/70 sm:flex-row">
      {/* Pita warna kategori - penanda visual cepat di daftar yang panjang. */}
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${accent.dot}`}
        aria-hidden
      />

      {article.featuredImage && (
        // next/image butuh images.remotePatterns di next.config.ts untuk host
        // Supabase Storage. Itu wilayah fitur Media (Dev B); ganti ke <Image>
        // begitu host-nya didaftarkan di sana.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.featuredImage.url}
          alt={article.featuredImage.altText ?? ""}
          className="aspect-16/10 w-full shrink-0 rounded-lg bg-zinc-100 object-cover sm:w-44"
          loading="lazy"
        />
      )}

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <Link
            href={`/kategori/${article.category.slug}`}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80 ${accent.badge}`}
          >
            {article.category.name}
          </Link>
          {article.publishedAt && (
            <time dateTime={article.publishedAt.toISOString()}>
              {formatArticleDate(article.publishedAt)}
            </time>
          )}
          {article.viewCount > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                {article.viewCount.toLocaleString("id-ID")} dibaca
              </span>
            </>
          )}
        </div>

        <h3 className="font-serif text-lg font-bold leading-snug text-zinc-900">
          <Link
            href={`/artikel/${article.slug}`}
            className="transition-colors group-hover:text-red-700"
          >
            {article.title}
          </Link>
        </h3>

        <div className="line-clamp-2 text-sm leading-relaxed text-zinc-600">
          {children ?? article.excerpt}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-zinc-700">{authorName}</span>
          {article.tags.slice(0, 3).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
