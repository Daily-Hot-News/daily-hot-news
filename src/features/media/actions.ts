"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authorize";
import { fail, ok, toUserMessage, type ActionResult } from "@/lib/actionResult";
import {
  removeImageObject,
  StorageError,
  uploadImageObject,
  type UploadedObject,
} from "@/lib/supabaseStorage";
import {
  ALLOWED_IMAGE_LABEL,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  MEDIA_PREVIEW_SELECT,
  type UploadImageResult,
} from "./types";

/** Baca width/height yang dikirim browser. Nilai tidak masuk akal diabaikan. */
function readDimension(formData: FormData, key: string): number | null {
  const value = Number(formData.get(key));
  if (!Number.isInteger(value) || value <= 0 || value > 100_000) return null;
  return value;
}

/**
 * Unggah satu gambar ke Supabase Storage lalu catat barisnya di tabel Media.
 *
 * Dipanggil langsung dari FeaturedImageField begitu admin memilih file, bukan
 * saat form artikel disubmit. Dengan begitu admin bisa melihat gambar yang
 * benar-benar tersimpan, dan gambar tidak hilang kalau validasi artikel gagal.
 */
export async function uploadImage(
  formData: FormData,
): Promise<UploadImageResult> {
  const authz = await requireAdmin();
  if (!authz.ok) return { error: authz.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Tidak ada gambar yang dipilih." };
  }

  // Validasi yang sama sudah dilakukan di browser. Diulang di sini karena
  // server action adalah endpoint POST yang bisa dipanggil tanpa lewat form.
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      error: `Format gambar tidak didukung. Pakai ${ALLOWED_IMAGE_LABEL}.`,
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `Ukuran gambar maksimal ${MAX_IMAGE_MB} MB.` };
  }

  let uploaded: UploadedObject | null = null;

  try {
    uploaded = await uploadImageObject({
      body: await file.arrayBuffer(),
      contentType: file.type,
      originalName: file.name,
    });

    const media = await prisma.media.create({
      data: {
        fileName: uploaded.path.split("/").pop() ?? uploaded.path,
        originalName: file.name,
        url: uploaded.url,
        // publicId menyimpan path objek di bucket - itu yang dibutuhkan kalau
        // nanti file-nya harus dihapus dari Storage.
        publicId: uploaded.path,
        mimeType: file.type,
        size: file.size,
        width: readDimension(formData, "width"),
        height: readDimension(formData, "height"),
        uploadedById: authz.user.id,
      },
      select: MEDIA_PREVIEW_SELECT,
    });

    return { success: true, media };
  } catch (error: unknown) {
    console.error("uploadImage gagal:", error);

    // File sudah naik tapi barisnya gagal dibuat: tanpa baris Media, objek itu
    // tidak akan pernah bisa direferensikan - buang supaya bucket tidak terisi
    // sampah yang tak terlacak.
    if (uploaded) await removeImageObject(uploaded.path);

    // Pesan StorageError memang ditulis untuk admin; error lain (mis. Prisma)
    // jangan dibocorkan apa adanya ke browser.
    if (error instanceof StorageError) return { error: error.message };
    return { error: toUserMessage(error, "Gagal menyimpan data gambar.") };
  }
}

/**
 * Hapus gambar yang tidak dipakai artikel mana pun, dari tabel Media sekaligus
 * dari bucket.
 *
 * Dipanggil FeaturedImageField saat admin mengganti atau membuang gambar yang
 * baru saja diunggah di form yang sama. Tanpa ini, setiap kali admin berganti
 * pikiran soal gambar, satu file nganggur tertinggal di bucket.
 *
 * Gambar yang masih dipakai artikel sengaja ditolak, bukan dihapus diam-diam:
 * melepas gambar dari sebuah artikel bukan alasan untuk menghapus filenya.
 */
export async function deleteUnusedImage(id: string): Promise<ActionResult> {
  const authz = await requireAdmin();
  if (!authz.ok) return fail(authz.error);

  try {
    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        publicId: true,
        _count: { select: { featuredArticles: true } },
      },
    });

    // Sudah tidak ada - tidak ada yang perlu dikerjakan, dan bagi pemanggilnya
    // hasilnya sama saja dengan berhasil dihapus.
    if (!media) return ok();

    if (media._count.featuredArticles > 0) {
      return fail("Gambar ini masih dipakai artikel, jadi tidak dihapus.");
    }

    // Baris dulu, file kemudian: kalau urutannya dibalik dan penghapusan baris
    // gagal, yang tertinggal adalah baris Media dengan URL yang sudah mati.
    await prisma.media.delete({ where: { id } });
    if (media.publicId) await removeImageObject(media.publicId);

    return ok();
  } catch (error: unknown) {
    console.error("deleteUnusedImage gagal:", error);
    return fail(toUserMessage(error, "Gagal menghapus gambar."));
  }
}
