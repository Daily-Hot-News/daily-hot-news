import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PUBLISHED_ARTICLE_SQL } from "@/lib/articleVisibility";
import { ARTICLE_CARD_SELECT } from "@/lib/articleCard";
import {
  EMPTY_SEARCH,
  HL_END,
  HL_START,
  type SearchHit,
  type SearchResponse,
} from "./types";

const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 50;

export type SearchArgs = {
  q: string;
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
};

/**
 * Filter tambahan yang sama persis dipakai query hasil maupun query hitungan,
 * supaya jumlah halaman tidak pernah berbeda dari isi halaman.
 */
function buildFilters(categorySlug?: string, tagSlug?: string): Prisma.Sql {
  const parts: Prisma.Sql[] = [];

  if (categorySlug) {
    parts.push(
      Prisma.sql`AND "categoryId" IN (SELECT "id" FROM "Category" WHERE "slug" = ${categorySlug})`,
    );
  }
  if (tagSlug) {
    parts.push(Prisma.sql`
      AND EXISTS (
        SELECT 1 FROM "ArticleTag" atg
        JOIN "Tag" t ON t."id" = atg."tagId"
        WHERE atg."articleId" = "Article"."id" AND t."slug" = ${tagSlug}
      )`);
  }

  return parts.length > 0 ? Prisma.join(parts, " ") : Prisma.empty;
}

/**
 * Cari artikel dengan PostgreSQL full-text search.
 *
 * Dua langkah, disengaja:
 *   1. Query mentah untuk peringkat + cuplikan - Prisma tidak mengenal tipe
 *      tsvector, jadi bagian ini tidak bisa lewat query builder.
 *   2. findMany bertipe untuk mengambil relasi (kategori, penulis, tag, gambar),
 *      lalu diurutkan ulang mengikuti peringkat dari langkah 1.
 *
 * `websearch_to_tsquery` dipakai (bukan `to_tsquery`) supaya user bisa mengetik
 * natural - `"tata negara"`, `jakarta -banjir` - dan input aneh seperti `&|!`
 * tidak melempar error, cuma menghasilkan nol hasil.
 */
export async function searchArticles({
  q,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
  categorySlug,
  tagSlug,
}: SearchArgs): Promise<SearchResponse> {
  const query = q.trim();
  if (!query) return EMPTY_SEARCH;

  const safePerPage = Math.min(Math.max(Math.trunc(perPage), 1), MAX_PER_PAGE);
  const safePage = Math.max(Math.trunc(page), 1);
  const offset = (safePage - 1) * safePerPage;
  const filters = buildFilters(categorySlug, tagSlug);

  try {
    const [ranked, countRows] = await Promise.all([
      prisma.$queryRaw<{ id: string; headline: string }[]>`
        SELECT
          "id",
          ts_headline(
            'simple',
            coalesce("excerpt", "content"),
            websearch_to_tsquery('simple', ${query}),
            ${`StartSel=${HL_START}, StopSel=${HL_END}, MaxWords=32, MinWords=12, ShortWord=2, MaxFragments=1`}
          ) AS headline
        FROM "Article"
        WHERE "search_vector" @@ websearch_to_tsquery('simple', ${query})
          AND ${PUBLISHED_ARTICLE_SQL}
          ${filters}
        ORDER BY
          ts_rank("search_vector", websearch_to_tsquery('simple', ${query})) DESC,
          "publishedAt" DESC
        LIMIT ${safePerPage} OFFSET ${offset}
      `,
      prisma.$queryRaw<{ total: number }[]>`
        SELECT count(*)::int AS total
        FROM "Article"
        WHERE "search_vector" @@ websearch_to_tsquery('simple', ${query})
          AND ${PUBLISHED_ARTICLE_SQL}
          ${filters}
      `,
    ]);

    const total = countRows[0]?.total ?? 0;
    if (ranked.length === 0) {
      return { ...EMPTY_SEARCH, total, page: safePage, perPage: safePerPage };
    }

    const ids = ranked.map((row) => row.id);
    const articles = await prisma.article.findMany({
      where: { id: { in: ids } },
      select: ARTICLE_CARD_SELECT,
    });

    // `IN (...)` tidak menjaga urutan, jadi susun ulang mengikuti peringkat.
    const byId = new Map(articles.map((article) => [article.id, article]));
    const hits: SearchHit[] = ranked.flatMap((row) => {
      const article = byId.get(row.id);
      return article ? [{ ...article, headline: row.headline }] : [];
    });

    return {
      hits,
      total,
      page: safePage,
      perPage: safePerPage,
      totalPages: Math.ceil(total / safePerPage),
    };
  } catch (error) {
    console.error("searchArticles gagal:", error);
    return EMPTY_SEARCH;
  }
}

/**
 * Saran kata kunci dari judul artikel, untuk dropdown autocomplete.
 * Sengaja pakai ILIKE prefix, bukan full-text: yang dicari kecocokan awalan
 * saat user masih mengetik, bukan relevansi dokumen.
 */
export async function suggestTitles(q: string, limit = 5) {
  const query = q.trim();
  if (query.length < 2) return [];

  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        title: { contains: query, mode: "insensitive" },
      },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("suggestTitles gagal:", error);
    return [];
  }
}
