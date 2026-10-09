import { prisma } from "@/lib/prisma";
import { publishedArticleWhere } from "@/lib/articleVisibility";
import {
  ARTICLE_ADMIN_ROW_SELECT,
  ARTICLE_DETAIL_SELECT,
  ARTICLE_EDIT_SELECT,
  type ArticleAdminRow,
  type ArticleDetail,
  type ArticleForEdit,
  type ArticleFormOptions,
} from "./types";

/**
 * Satu artikel untuk halaman publik /artikel/[slug].
 *
 * Filternya digabung dengan publishedArticleWhere() supaya artikel DRAFT,
 * SCHEDULED, dan ARCHIVED tidak bisa dibuka lewat URL langsung - bukan hanya
 * disembunyikan dari daftar.
 */
export async function getPublishedArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  try {
    return await prisma.article.findFirst({
      where: { slug, ...publishedArticleWhere() },
      select: ARTICLE_DETAIL_SELECT,
    });
  } catch (error) {
    console.error("getPublishedArticleBySlug gagal:", error);
    return null;
  }
}

/** Artikel tayang lain di kategori yang sama, untuk tautan "baca juga". */
export async function getRelatedArticles(args: {
  articleId: string;
  categorySlug: string;
  take?: number;
}): Promise<{ title: string; slug: string }[]> {
  const { articleId, categorySlug, take = 4 } = args;

  try {
    return await prisma.article.findMany({
      where: {
        ...publishedArticleWhere(),
        category: { slug: categorySlug },
        id: { not: articleId },
      },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "desc" },
      take,
    });
  } catch (error) {
    console.error("getRelatedArticles gagal:", error);
    return [];
  }
}

/**
 * Daftar artikel untuk dashboard admin - semua status, bukan hanya yang tayang.
 * Sengaja dipaginasi supaya tabelnya tidak diam-diam terpotong saat data tumbuh.
 */
export async function listArticlesForAdmin(args: {
  page?: number;
  perPage?: number;
}): Promise<{ articles: ArticleAdminRow[]; total: number }> {
  const { page = 1, perPage = 10 } = args;

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        select: ARTICLE_ADMIN_ROW_SELECT,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.article.count(),
    ]);

    return { articles, total };
  } catch (error) {
    console.error("listArticlesForAdmin gagal:", error);
    return { articles: [], total: 0 };
  }
}

export async function getArticleForEdit(
  id: string,
): Promise<ArticleForEdit | null> {
  try {
    return await prisma.article.findUnique({
      where: { id },
      select: ARTICLE_EDIT_SELECT,
    });
  } catch (error) {
    console.error("getArticleForEdit gagal:", error);
    return null;
  }
}

/** Isi dropdown kategori dan daftar tag untuk form artikel. */
export async function getArticleFormOptions(): Promise<ArticleFormOptions> {
  try {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return { categories, tags };
  } catch (error) {
    console.error("getArticleFormOptions gagal:", error);
    return { categories: [], tags: [] };
  }
}
