import { Prisma } from "@prisma/client";
import { MEDIA_PREVIEW_SELECT } from "@/features/media/types";

/**
 * Kolom untuk halaman detail artikel publik.
 *
 * Beda dari ARTICLE_CARD_SELECT di src/lib/articleCard.ts: di sini `content`
 * ikut ditarik, karena memang itu isi halamannya.
 */
export const ARTICLE_DETAIL_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  publishedAt: true,
  updatedAt: true,
  metaTitle: true,
  metaDescription: true,
  category: { select: { name: true, slug: true } },
  featuredImage: { select: { url: true, altText: true, caption: true } },
  author: {
    select: {
      name: true,
      authorProfile: {
        select: { displayName: true, slug: true, jobTitle: true },
      },
    },
  },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} satisfies Prisma.ArticleSelect;

export type ArticleDetail = Prisma.ArticleGetPayload<{
  select: typeof ARTICLE_DETAIL_SELECT;
}>;

/** Satu baris di tabel daftar artikel pada dashboard admin. */
export const ARTICLE_ADMIN_ROW_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  author: { select: { name: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleAdminRow = Prisma.ArticleGetPayload<{
  select: typeof ARTICLE_ADMIN_ROW_SELECT;
}>;

/** Artikel yang sedang dibuka di form edit, lengkap dengan tag terpilih. */
export const ARTICLE_EDIT_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  categoryId: true,
  status: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  // featuredImage ikut ditarik supaya form bisa langsung menampilkan preview
  // gambar yang sudah terpasang, bukan cuma id-nya.
  featuredImage: { select: MEDIA_PREVIEW_SELECT },
  tags: { select: { tagId: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleForEdit = Prisma.ArticleGetPayload<{
  select: typeof ARTICLE_EDIT_SELECT;
}>;

/** Pilihan kategori & tag untuk dropdown dan checkbox di form artikel. */
export type ArticleFormOptions = {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};
