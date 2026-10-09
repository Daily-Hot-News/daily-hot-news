import { Prisma } from "@prisma/client";

/**
 * Kolom gambar yang dibutuhkan untuk preview di form admin.
 * Dipakai juga oleh ARTICLE_EDIT_SELECT supaya bentuknya tidak berbeda.
 */
export const MEDIA_PREVIEW_SELECT = {
  id: true,
  url: true,
  altText: true,
  caption: true,
} satisfies Prisma.MediaSelect;

export type MediaPreview = Prisma.MediaGetPayload<{
  select: typeof MEDIA_PREVIEW_SELECT;
}>;

/**
 * Batas ukuran upload.
 *
 * Harus tetap di bawah `experimental.serverActions.bodySizeLimit` di
 * next.config.ts: file dikirim lewat server action, dan kalau request-nya
 * melebihi limit itu Next.js menolaknya sebelum action mana pun jalan - jadi
 * errornya tidak akan muncul sebagai pesan yang rapi di form.
 */
export const MAX_IMAGE_MB = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

/**
 * Format yang diterima. Dipakai dua sisi: FeaturedImageField (supaya file yang
 * pasti ditolak tidak sampai dikirim) dan uploadImage() (karena server action
 * bisa dipanggil lewat POST langsung, tanpa melewati form).
 */
export const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const ALLOWED_IMAGE_LABEL = "JPG, PNG, WebP, atau AVIF";

/**
 * Bentuk balikan uploadImage(). Beda dari ActionResult biasa karena form perlu
 * tahu id dan URL gambar yang baru tersimpan, bukan cuma berhasil/gagal.
 */
export type UploadImageResult =
  | { success: true; media: MediaPreview; error?: undefined }
  | { success?: undefined; media?: undefined; error: string };
