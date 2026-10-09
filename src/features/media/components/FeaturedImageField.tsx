"use client";

import { useRef, useState, useTransition } from "react";
import { deleteUnusedImage, uploadImage } from "../actions";
import {
  ALLOWED_IMAGE_LABEL,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  type MediaPreview,
} from "../types";

/**
 * Baca dimensi asli gambar di browser.
 *
 * Dikerjakan di sini, bukan di server, supaya kolom width/height tabel Media
 * bisa terisi tanpa menambah library pemroses gambar. Kalau gagal, upload tetap
 * dilanjutkan dengan dimensi kosong - itu bukan data yang wajib ada.
 */
async function readImageSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

type FeaturedImageFieldProps = {
  initialMedia?: MediaPreview | null;
};

/**
 * Pemilih gambar sampul untuk form artikel.
 *
 * Gambarnya diunggah seketika saat dipilih, lalu yang ikut tersubmit bersama
 * form artikel hanyalah `featuredImageId` (plus alt text & caption). Komponen
 * ini harus dirender DI DALAM <form> artikel.
 */
export function FeaturedImageField({ initialMedia }: FeaturedImageFieldProps) {
  const [media, setMedia] = useState<MediaPreview | null>(initialMedia ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * Id gambar yang diunggah selama form ini dibuka, jadi belum tentu dipakai
   * artikel mana pun. Hanya yang terdaftar di sini yang boleh ikut dihapus dari
   * bucket - gambar awal artikel cukup dilepas (featuredImageId dikosongkan),
   * filenya jangan disentuh karena bisa jadi masih dipakai di tempat lain.
   */
  const sessionUploads = useRef(new Set<string>());

  /** Buang gambar dari bucket, tapi hanya kalau diunggah dari form ini. */
  function cleanUp(candidate: MediaPreview | null) {
    if (!candidate || !sessionUploads.current.has(candidate.id)) return;

    sessionUploads.current.delete(candidate.id);
    startTransition(async () => {
      const result = await deleteUnusedImage(candidate.id);
      // Gagal bersih-bersih bukan kesalahan yang bisa ditindaklanjuti admin:
      // gambar yang dimaksud sudah lepas dari form, yang tertinggal cuma file
      // nganggur di bucket.
      if (result?.error) console.warn("Gagal menghapus gambar:", result.error);
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Dikosongkan supaya memilih file yang sama dua kali tetap memicu change -
    // misalnya setelah upload pertama gagal karena jaringan.
    event.target.value = "";
    if (!file) return;

    setError(null);

    // Dicek lebih dulu di sini supaya file yang pasti ditolak tidak perlu
    // dikirim ke server. uploadImage() tetap memvalidasi ulang.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`Format gambar tidak didukung. Pakai ${ALLOWED_IMAGE_LABEL}.`);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Ukuran gambar maksimal ${MAX_IMAGE_MB} MB.`);
      return;
    }

    const replaced = media;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);

      const size = await readImageSize(file);
      if (size) {
        formData.set("width", String(size.width));
        formData.set("height", String(size.height));
      }

      // Dicek lewat `success`, bukan `result.error`: tipe error-nya `string`
      // yang bisa saja "" (falsy), jadi truthiness-nya tidak menyempitkan union.
      const result = await uploadImage(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      sessionUploads.current.add(result.media.id);
      setMedia(result.media);
      cleanUp(replaced);
    });
  }

  function handleRemove() {
    const removed = media;
    setMedia(null);
    setError(null);
    cleanUp(removed);
  }

  const fieldClass =
    "border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "text-sm font-medium";

  return (
    <div className="flex flex-col gap-3">
      <span className={labelClass}>
        Gambar Sampul
        <span className="ml-1 font-normal text-zinc-500">
          (opsional; {ALLOWED_IMAGE_LABEL}, maksimal {MAX_IMAGE_MB} MB)
        </span>
      </span>

      {/*
        Satu-satunya bagian gambar yang dibaca createArticle/updateArticle.
        Perhatikan input file di bawah sengaja TANPA atribut `name`: filenya
        sudah naik ke Storage lewat uploadImage(), jadi kalau input itu punya
        nama, byte gambarnya akan ikut terkirim lagi saat form artikel disubmit
        dan berisiko menembus bodySizeLimit.
      */}
      <input type="hidden" name="featuredImageId" value={media?.id ?? ""} />

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {media && (
        <figure className="flex flex-col gap-2">
          {/* Pakai <img>, bukan next/image: optimasi next/image butuh host
              Supabase terdaftar di images.remotePatterns, dan preview di admin
              tidak perlu dioptimasi. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.url}
            alt=""
            className="w-full max-w-md rounded border border-zinc-200 bg-zinc-100 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="w-fit text-sm text-red-700 underline disabled:opacity-50"
          >
            Hapus gambar
          </button>
        </figure>
      )}

      <input
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={isPending}
        aria-label={media ? "Ganti gambar sampul" : "Pilih gambar sampul"}
        className="text-sm file:mr-3 file:rounded file:border file:border-zinc-300 file:bg-zinc-50 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-100 disabled:opacity-50"
      />

      {isPending && (
        <p className="text-xs text-zinc-500" aria-live="polite">
          Mengunggah gambar...
        </p>
      )}

      {media && (
        // key dipasang supaya kedua input ini remount saat gambarnya diganti -
        // tanpa itu defaultValue yang baru diabaikan React.
        <div key={media.id} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="featuredImageAlt" className={labelClass}>
              Alt Text
              <span className="ml-1 font-normal text-zinc-500">
                (deskripsi gambar untuk pembaca layar &amp; SEO)
              </span>
            </label>
            <input
              id="featuredImageAlt"
              name="featuredImageAlt"
              type="text"
              defaultValue={media.altText ?? ""}
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="featuredImageCaption" className={labelClass}>
              Keterangan Gambar
              <span className="ml-1 font-normal text-zinc-500">
                (tampil di bawah gambar, mis. sumber foto)
              </span>
            </label>
            <input
              id="featuredImageCaption"
              name="featuredImageCaption"
              type="text"
              defaultValue={media.caption ?? ""}
              className={fieldClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
