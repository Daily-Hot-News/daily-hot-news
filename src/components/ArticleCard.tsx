import Link from "next/link";
import type { ArticleCardData } from "@/lib/articleCard";

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

  return (
    <article className="flex gap-4 border border-zinc-200 rounded-lg p-4 hover:border-zinc-400 transition-colors">
      {article.featuredImage && (
        // next/image butuh images.remotePatterns di next.config.ts untuk host
        // Supabase Storage. Itu wilayah fitur Media (Dev B); ganti ke <Image>
        // begitu host-nya didaftarkan di sana.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.featuredImage.url}
          alt={article.featuredImage.altText ?? ""}
          className="w-28 h-20 object-cover rounded shrink-0 bg-zinc-100"
          loading="lazy"
        />
      )}

      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link
            href={`/kategori/${article.category.slug}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {article.category.name}
          </Link>
          {article.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt.toISOString()}>
                {formatArticleDate(article.publishedAt)}
              </time>
            </>
          )}
        </div>

        <h3 className="font-semibold leading-snug">
          <Link href={`/artikel/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>

        <div className="text-sm text-zinc-600 line-clamp-2">
          {children ?? article.excerpt}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
          <span>{authorName}</span>
          {article.tags.slice(0, 3).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="px-2 py-0.5 bg-zinc-100 rounded-full hover:bg-zinc-200"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
