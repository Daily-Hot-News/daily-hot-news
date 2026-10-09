"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticle, updateArticle } from "../actions";
import { FeaturedImageField } from "@/features/media/components/FeaturedImageField";
import { slugify } from "@/lib/slugify";
import type { ArticleForEdit, ArticleFormOptions } from "../types";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft - belum tayang" },
  { value: "SCHEDULED", label: "Terjadwal" },
  { value: "PUBLISHED", label: "Tayang" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

/** Format Date jadi nilai untuk <input type="datetime-local"> (waktu lokal). */
function toDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

type ArticleFormProps = {
  initialData?: ArticleForEdit | null;
  options: ArticleFormOptions;
};

export function ArticleForm({ initialData, options }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = !!initialData;
  const selectedTagIds = new Set(initialData?.tags.map((t) => t.tagId) ?? []);

  /** Isi slug otomatis dari judul, selama user belum mengetik slug sendiri. */
  function handleTitleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const form = formRef.current;
    if (!form || isEditing) return;

    const slugInput = form.elements.namedItem("slug") as HTMLInputElement | null;
    if (slugInput && !slugInput.dataset.touched) {
      slugInput.value = slugify(event.target.value);
    }
  }

  function onSubmit(formData: FormData) {
    setError(null);

    // <input type="datetime-local"> mengirim waktu lokal tanpa zona waktu.
    // Kalau dikirim apa adanya, server memaknainya pakai zona waktunya sendiri
    // (biasanya UTC) sehingga jadwal tayang bergeser. Diubah ke ISO di browser,
    // di mana zona waktu user memang diketahui.
    const raw = formData.get("publishedAt");
    if (typeof raw === "string" && raw) {
      formData.set("publishedAt", new Date(raw).toISOString());
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateArticle(initialData.id, formData)
        : await createArticle(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/admin/articles");
    });
  }

  const fieldClass =
    "border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "text-sm font-medium";

  return (
    <form ref={formRef} action={onSubmit} className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className={labelClass}>
          Judul
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title ?? ""}
          onChange={handleTitleInput}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className={labelClass}>
          Slug
          <span className="ml-1 font-normal text-zinc-500">
            (kosongkan untuk dibuat otomatis)
          </span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={initialData?.slug ?? ""}
          onChange={(e) => {
            e.currentTarget.dataset.touched = "true";
          }}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="excerpt" className={labelClass}>
          Ringkasan
          <span className="ml-1 font-normal text-zinc-500">
            (tampil di kartu artikel &amp; hasil pencarian)
          </span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={initialData?.excerpt ?? ""}
          className={fieldClass}
        />
      </div>

      <FeaturedImageField initialMedia={initialData?.featuredImage} />

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className={labelClass}>
          Isi Artikel
          <span className="ml-1 font-normal text-zinc-500">
            (teks biasa; pisahkan paragraf dengan baris kosong)
          </span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={16}
          required
          defaultValue={initialData?.content ?? ""}
          className={`${fieldClass} font-mono`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className={labelClass}>
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initialData?.categoryId ?? ""}
            className={fieldClass}
          >
            <option value="">— Pilih kategori —</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {options.categories.length === 0 && (
            <p className="text-xs text-amber-700">
              Belum ada kategori.{" "}
              <Link href="/admin/categories" className="underline">
                Buat kategori dulu
              </Link>
              .
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? "DRAFT"}
            className={fieldClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="publishedAt" className={labelClass}>
          Waktu Tayang
          <span className="ml-1 font-normal text-zinc-500">
            (kosongkan untuk diisi otomatis saat status Tayang)
          </span>
        </label>
        <input
          id="publishedAt"
          name="publishedAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(initialData?.publishedAt ?? null)}
          className={`${fieldClass} w-fit`}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>Tag</legend>
        {options.tags.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Belum ada tag.{" "}
            <Link href="/admin/tags" className="underline">
              Kelola tag
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {options.tags.map((tag) => (
              <label
                key={tag.id}
                className="inline-flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedTagIds.has(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <details className="border border-zinc-200 rounded p-4">
        <summary className="text-sm font-medium cursor-pointer">
          SEO (opsional)
        </summary>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="metaTitle" className={labelClass}>
              Meta Title
            </label>
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              defaultValue={initialData?.metaTitle ?? ""}
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="metaDescription" className={labelClass}>
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              rows={2}
              defaultValue={initialData?.metaDescription ?? ""}
              className={fieldClass}
            />
          </div>
        </div>
      </details>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-zinc-900 text-white rounded px-4 py-2 font-medium hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : isEditing
              ? "Simpan Perubahan"
              : "Buat Artikel"}
        </button>

        <Link
          href="/admin/articles"
          className="rounded px-4 py-2 font-medium border border-zinc-300 hover:bg-zinc-100"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
