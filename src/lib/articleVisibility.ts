import { Prisma } from "@prisma/client";

/**
 * Filter tunggal untuk "artikel yang boleh dilihat publik".
 *
 * Dipakai halaman kategori, halaman tag, hasil pencarian, dan sitemap - supaya
 * aturannya cuma ditulis sekali dan artikel DRAFT / SCHEDULED / ARCHIVED tidak
 * bisa bocor lewat salah satu jalur yang terlupakan.
 *
 * Sengaja berupa fungsi, bukan konstanta: `new Date()` harus dievaluasi tiap
 * request, bukan sekali saat modul di-load.
 */
export function publishedArticleWhere(): Prisma.ArticleWhereInput {
  return {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };
}

/** Varian SQL dari filter di atas, untuk query full-text search via $queryRaw. */
export const PUBLISHED_ARTICLE_SQL = Prisma.sql`
  "status" = 'PUBLISHED'::"ArticleStatus"
  AND "publishedAt" IS NOT NULL
  AND "publishedAt" <= now()
`;
