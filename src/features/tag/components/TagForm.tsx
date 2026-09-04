"use client";

import { useRef, useState, useTransition } from "react";
import { createTag, updateTag } from "../actions";
import { slugify } from "@/lib/slugify";
import type { TagWithCount } from "../types";

interface TagFormProps {
  initialData?: TagWithCount | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TagForm({ initialData, onSuccess, onCancel }: TagFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = !!initialData;

  function handleNameInput(event: React.ChangeEvent<HTMLInputElement>) {
    const form = formRef.current;
    if (!form || isEditing) return;

    const slugInput = form.elements.namedItem("slug") as HTMLInputElement | null;
    if (slugInput && !slugInput.dataset.touched) {
      slugInput.value = slugify(event.target.value);
    }
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateTag(initialData.id, formData)
        : await createTag(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (!isEditing) formRef.current?.reset();
      onSuccess?.();
    });
  }

  const fieldClass =
    "border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="flex flex-col gap-4 max-w-md w-full"
    >
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-100 text-red-700 rounded text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nama
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialData?.name ?? ""}
          onChange={handleNameInput}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
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

      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-zinc-900 text-white rounded px-4 py-2 font-medium hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : isEditing
              ? "Simpan Perubahan"
              : "Buat Tag"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded px-4 py-2 font-medium border border-zinc-300 hover:bg-zinc-100 disabled:opacity-50"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
