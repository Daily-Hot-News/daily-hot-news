import { Prisma } from "@prisma/client";

/**
 * Kolom artikel yang dibutuhkan untuk menampilkan satu kartu di daftar
 * (halaman kategori, halaman tag, hasil pencarian).
 *
 * Sengaja `select`, bukan `include`: `content` artikel bisa panjang sekali dan
 * tidak pernah dipakai di kartu, jadi jangan ikut ditarik dari database.
 */
export const ARTICLE_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  viewCount: true,
  category: { select: { name: true, slug: true } },
  featuredImage: { select: { url: true, altText: true } },
  author: {
    select: {
      name: true,
      authorProfile: { select: { displayName: true, slug: true } },
    },
  },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} satisfies Prisma.ArticleSelect;

export type ArticleCardData = Prisma.ArticleGetPayload<{
  select: typeof ARTICLE_CARD_SELECT;
}>;
