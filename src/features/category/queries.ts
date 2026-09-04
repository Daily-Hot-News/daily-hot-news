import { prisma } from "@/lib/prisma";
import { publishedArticleWhere } from "@/lib/articleVisibility";
import { ARTICLE_CARD_SELECT, type ArticleCardData } from "@/lib/articleCard";
import type {
  CategoryWithCount,
  CategoryWithParent,
  CategoryTreeNode,
} from "./types";

export async function getCategories(): Promise<CategoryWithParent[]> {
  try {
    return await prisma.category.findMany({
      include: { parent: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getCategories gagal:", error);
    return [];
  }
}

export async function getCategoryById(id: string) {
  try {
    return await prisma.category.findUnique({
      where: { id },
      include: { parent: true },
    });
  } catch (error) {
    console.error("getCategoryById gagal:", error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { orderBy: { name: "asc" } },
      },
    });
  } catch (error) {
    console.error("getCategoryBySlug gagal:", error);
    return null;
  }
}

/**
 * Kategori + jumlah artikel yang sudah tayang. Dipakai tabel admin dan
 * navigasi publik, supaya kategori kosong bisa dibedakan.
 */
export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  try {
    return await prisma.category.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            articles: { where: publishedArticleWhere() },
            children: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getCategoriesWithCount gagal:", error);
    return [];
  }
}

/** Kategori tingkat atas beserta anak-anaknya, untuk menu navigasi. */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: { orderBy: { name: "asc" } },
        _count: { select: { articles: { where: publishedArticleWhere() } } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getCategoryTree gagal:", error);
    return [];
  }
}

type CategoryArticlesArgs = {
  slug: string;
  page?: number;
  perPage?: number;
  /** Ikut sertakan artikel dari sub-kategori. */
  includeChildren?: boolean;
};

/**
 * Artikel tayang dalam sebuah kategori, dengan paginasi.
 * Hanya membaca model Article milik Dev B - tidak mengubah apa pun di sana.
 */
export async function getArticlesByCategorySlug({
  slug,
  page = 1,
  perPage = 10,
  includeChildren = true,
}: CategoryArticlesArgs): Promise<{
  articles: ArticleCardData[];
  total: number;
}> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, children: { select: { id: true } } },
    });
    if (!category) return { articles: [], total: 0 };

    const categoryIds = includeChildren
      ? [category.id, ...category.children.map((child) => child.id)]
      : [category.id];

    const where = {
      ...publishedArticleWhere(),
      categoryId: { in: categoryIds },
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
    console.error("getArticlesByCategorySlug gagal:", error);
    return { articles: [], total: 0 };
  }
}
