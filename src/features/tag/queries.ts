import { prisma } from "@/lib/prisma";
import { publishedArticleWhere } from "@/lib/articleVisibility";
import { ARTICLE_CARD_SELECT, type ArticleCardData } from "@/lib/articleCard";
import type { TagWithCount } from "./types";

/** Semua tag + jumlah artikel tayang, urut abjad. Untuk tabel admin. */
export async function getTags(): Promise<TagWithCount[]> {
  try {
    return await prisma.tag.findMany({
      include: {
        _count: { select: { articles: { where: { article: publishedArticleWhere() } } } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getTags gagal:", error);
    return [];
  }
}

export async function getTagById(id: string) {
  try {
    return await prisma.tag.findUnique({ where: { id } });
  } catch (error) {
    console.error("getTagById gagal:", error);
    return null;
  }
}

export async function getTagBySlug(slug: string) {
  try {
    return await prisma.tag.findUnique({ where: { slug } });
  } catch (error) {
    console.error("getTagBySlug gagal:", error);
    return null;
  }
}

/** Tag terpopuler berdasarkan jumlah artikel tayang. Untuk widget "tag cloud". */
export async function getPopularTags(limit = 20): Promise<TagWithCount[]> {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { articles: { where: { article: publishedArticleWhere() } } } },
      },
      orderBy: { articles: { _count: "desc" } },
      take: limit,
    });
    // Tag tanpa artikel tayang tidak berguna di tag cloud.
    return tags.filter((tag) => tag._count.articles > 0);
  } catch (error) {
    console.error("getPopularTags gagal:", error);
    return [];
  }
}

export async function getTagsByArticleId(articleId: string) {
  try {
    const rows = await prisma.articleTag.findMany({
      where: { articleId },
      select: { tag: true },
      orderBy: { tag: { name: "asc" } },
    });
    return rows.map((row) => row.tag);
  } catch (error) {
    console.error("getTagsByArticleId gagal:", error);
    return [];
  }
}

type TagArticlesArgs = {
  slug: string;
  page?: number;
  perPage?: number;
};

/** Artikel tayang yang memakai sebuah tag, dengan paginasi. */
export async function getArticlesByTagSlug({
  slug,
  page = 1,
  perPage = 10,
}: TagArticlesArgs): Promise<{ articles: ArticleCardData[]; total: number }> {
  try {
    const where = {
      ...publishedArticleWhere(),
      tags: { some: { tag: { slug } } },
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: ARTICLE_CARD_SELECT,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, total };
  } catch (error) {
    console.error("getArticlesByTagSlug gagal:", error);
    return { articles: [], total: 0 };
  }
}
