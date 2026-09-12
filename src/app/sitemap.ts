import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publishedArticleWhere } from "@/lib/articleVisibility";
import { SITE_URL } from "@/lib/site";

/** Sitemap dibangun ulang paling sering sejam sekali, bukan tiap request. */
export const revalidate = 3600;

/**
 * Batas resmi satu file sitemap adalah 50.000 URL. Kalau situsnya tumbuh
 * melewati ini, pecah dengan generateSitemaps() alih-alih menaikkan angkanya.
 */
const MAX_URLS_PER_TYPE = 15_000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const [articles, categories, tags] = await Promise.all([
      prisma.article.findMany({
        where: publishedArticleWhere(),
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: MAX_URLS_PER_TYPE,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { name: "asc" },
        take: MAX_URLS_PER_TYPE,
      }),
      // Tag tanpa artikel tayang menghasilkan halaman kosong - jangan
      // disodorkan ke mesin pencari.
      prisma.tag.findMany({
        where: { articles: { some: { article: publishedArticleWhere() } } },
        select: { slug: true, updatedAt: true },
        orderBy: { name: "asc" },
        take: MAX_URLS_PER_TYPE,
      }),
    ]);

    return [
      ...staticRoutes,
      ...articles.map((article) => ({
        url: `${SITE_URL}/artikel/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((category) => ({
        url: `${SITE_URL}/kategori/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
      ...tags.map((tag) => ({
        url: `${SITE_URL}/tag/${tag.slug}`,
        lastModified: tag.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    // Database bermasalah bukan alasan untuk menyajikan sitemap rusak -
    // lebih baik kembalikan yang statis saja daripada 500.
    console.error("Gagal membangun sitemap dari database:", error);
    return staticRoutes;
  }
}
