"use client";

import { useTransition } from "react";
import { deleteCategory } from "../actions";
import type { CategoryWithParent } from "../types";

export function CategoryList({
  categories,
}: {
  categories: CategoryWithParent[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      startTransition(async () => {
        const result = await deleteCategory(id);
        if (result?.error) {
          alert(result.error);
        }
      });
    }
  };

  if (categories.length === 0) {
    return (
      <div className="p-4 text-zinc-500 border rounded">
        No categories found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 border rounded">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Parent
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-zinc-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                {category.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                {category.slug}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                {category.parent ? (
                  category.parent.name
                ) : (
                  <span className="text-zinc-400 italic">None</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                <button
                  onClick={() =>
                    alert(
                      `To edit, pass this category to CategoryForm. ID: ${category.id}`,
                    )
                  }
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
