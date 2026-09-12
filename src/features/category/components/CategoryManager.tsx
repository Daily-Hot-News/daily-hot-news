"use client";

import { useState } from "react";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import type { CategoryWithCount } from "../types";

/**
 * Menyatukan form dan tabel supaya keduanya berbagi satu state "sedang mengedit
 * kategori apa" - tombol Edit di tabel langsung mengisi form di sebelahnya.
 */
export function CategoryManager({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-10">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {editing ? `Edit "${editing.name}"` : "Buat Kategori Baru"}
        </h2>
        <CategoryForm
          // Remount saat berganti kategori supaya defaultValue ikut ter-refresh.
          key={editing?.id ?? "create"}
          initialData={editing}
          categories={categories}
          onSuccess={() => setEditing(null)}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Daftar Kategori</h2>
        <CategoryList
          categories={categories}
          onEdit={setEditing}
          editingId={editing?.id}
        />
      </div>
    </div>
  );
}
