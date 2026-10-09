"use server";

import { revalidatePath } from "next/cache";
import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorize";
import { resolveSlug } from "@/lib/slugify";
import { fail, ok, toUserMessage, type ActionResult } from "@/lib/actionResult";

/** Halaman yang perlu di-refresh setiap kali data artikel berubah. */
function revalidateArticlePages() {
  revalidatePath("/admin/articles");
  revalidatePath("/artikel/[slug]", "page");
  revalidatePath("/kategori/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  revalidatePath("/");
}

const STATUSES = Object.values(ArticleStatus);

function readStatus(value: FormDataEntryValue | null): ArticleStatus | null {
  const status = typeof value === "string" ? value : "";
  return (STATUSES as string[]).includes(status)
    ? (status as ArticleStatus)
    : null;
}

type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  categoryId: string;
  featuredImageId: string | null;
  status: ArticleStatus;
  publishedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  tagIds: string[];
};

function text(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() ?? "";
}

/**
 * Baca form jadi data siap simpan, atau pesan error kalau ada yang kurang.
 * Validasi dikerjakan di sini supaya create dan update tidak berbeda aturan.
 */
function readForm(formData: FormData): ArticleInput | string {
  const title = text(formData, "title");
  if (!title) return "Judul artikel wajib diisi.";

  const content = text(formData, "content");
  if (!content) return "Isi artikel wajib diisi.";

  const categoryId = text(formData, "categoryId");
  if (!categoryId) return "Kategori wajib dipilih.";

  const slug = resolveSlug(formData.get("slug") as string | null, title);
  if (!slug) {
    return "Judul artikel harus mengandung minimal satu huruf atau angka.";
  }

  const status = readStatus(formData.get("status"));
  if (!status) return "Status artikel tidak dikenali.";

  const publishedAtRaw = text(formData, "publishedAt");
  let publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : null;
  if (publishedAt && Number.isNaN(publishedAt.getTime())) {
    return "Tanggal tayang tidak valid.";
  }

  // Artikel PUBLISHED tanpa publishedAt tidak akan pernah lolos filter
  // publishedArticleWhere(), jadi diam-diam hilang dari situs. Isi otomatis
  // dengan waktu sekarang daripada menyimpan artikel yang tidak bisa dilihat.
  if (status === "PUBLISHED" && !publishedAt) {
    publishedAt = new Date();
  }

  return {
    title,
    slug,
    excerpt: text(formData, "excerpt") || null,
    content,
    categoryId,
    // Gambarnya sendiri sudah diunggah FeaturedImageField lewat uploadImage();
    // yang sampai ke sini cuma id baris Media-nya. Kosong = tanpa sampul.
    featuredImageId: text(formData, "featuredImageId") || null,
    status,
    publishedAt,
    metaTitle: text(formData, "metaTitle") || null,
    metaDescription: text(formData, "metaDescription") || null,
    tagIds: formData.getAll("tagIds").filter((id): id is string => !!id),
  };
}

/**
 * Simpan alt text & caption ke baris Media-nya, dan sekaligus pastikan id
 * gambar yang dikirim form memang ada.
 *
 * Alt text dan caption memang milik tabel Media, bukan Article, tapi diisinya
 * di form artikel - jadi ikut disimpan dari sini. Dijalankan SEBELUM artikel
 * ditulis: kalau idnya ngawur (form bisa di-POST langsung), artikelnya belum
 * terbuat sehingga pesan errornya tidak menyesatkan, dan Prisma tidak perlu
 * menolaknya sebagai pelanggaran foreign key dengan pesan yang tidak nyambung.
 *
 * Balikannya: null kalau beres, atau pesan error untuk ditampilkan ke admin.
 */
async function saveFeaturedImageMeta(
  mediaId: string,
  formData: FormData,
): Promise<string | null> {
  try {
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        altText: text(formData, "featuredImageAlt") || null,
        caption: text(formData, "featuredImageCaption") || null,
      },
    });
    return null;
  } catch (error: unknown) {
    console.error("saveFeaturedImageMeta gagal:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return "Gambar sampul tidak ditemukan. Coba unggah ulang gambarnya.";
    }
    return "Gagal menyimpan keterangan gambar sampul.";
  }
}

export async function createArticle(formData: FormData): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) return fail(authz.error);

  const input = readForm(formData);
  if (typeof input === "string") return fail(input);

  try {
    const duplicate = await prisma.article.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (duplicate) {
      return fail(`Slug "${input.slug}" sudah dipakai artikel lain.`);
    }

    if (input.featuredImageId) {
      const imageError = await saveFeaturedImageMeta(
        input.featuredImageId,
        formData,
      );
      if (imageError) return fail(imageError);
    }

    const { tagIds, ...data } = input;
    await prisma.article.create({
      data: {
        ...data,
        authorId: authz.user.id,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });

    revalidateArticlePages();
    return ok();
  } catch (error: unknown) {
    console.error("createArticle gagal:", error);
    return fail(toUserMessage(error, "Gagal membuat artikel."));
  }
}

export async function updateArticle(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) return fail(authz.error);

  const input = readForm(formData);
  if (typeof input === "string") return fail(input);

  try {
    const duplicate = await prisma.article.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (duplicate && duplicate.id !== id) {
      return fail(`Slug "${input.slug}" sudah dipakai artikel lain.`);
    }

    if (input.featuredImageId) {
      const imageError = await saveFeaturedImageMeta(
        input.featuredImageId,
        formData,
      );
      if (imageError) return fail(imageError);
    }

    const { tagIds, ...data } = input;
    await prisma.article.update({
      where: { id },
      data: {
        ...data,
        // Tag diganti total, bukan ditambah: daftar dari form adalah
        // kondisi akhir yang diinginkan.
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });

    revalidateArticlePages();
    return ok();
  } catch (error: unknown) {
    console.error("updateArticle gagal:", error);
    return fail(toUserMessage(error, "Gagal memperbarui artikel."));
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) return fail(authz.error);

  try {
    // ArticleTag dan Comment pakai onDelete: Cascade, jadi ikut terhapus.
    await prisma.article.delete({ where: { id } });

    revalidateArticlePages();
    return ok();
  } catch (error: unknown) {
    console.error("deleteArticle gagal:", error);
    return fail(toUserMessage(error, "Gagal menghapus artikel."));
  }
}
