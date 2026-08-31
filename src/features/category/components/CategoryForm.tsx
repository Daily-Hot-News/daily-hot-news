"use client";

import { useState, useTransition } from "react";
import { createCategory, updateCategory } from "../actions";
import type { CategoryWithParent } from "../types";

interface CategoryFormProps {
  initialData?: CategoryWithParent | null;
  categories?: CategoryWithParent[];
  onSuccess?: () => void;
}

export function CategoryForm({
  initialData,
  categories = [],
  onSuccess,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateCategory(initialData.id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        if (onSuccess) onSuccess();
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 max-w-md w-full">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialData?.name || ""}
          className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          defaultValue={initialData?.slug || ""}
          className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="parentId" className="text-sm font-medium">
          Parent Category
        </label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={initialData?.parentId || ""}
          className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None (Top Level)</option>
          {categories
            .filter((c) => c.id !== initialData?.id) // Prevent self as parent
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 bg-zinc-900 text-white rounded px-4 py-2 font-medium hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : isEditing
            ? "Update Category"
            : "Create Category"}
      </button>
    </form>
  );
}
