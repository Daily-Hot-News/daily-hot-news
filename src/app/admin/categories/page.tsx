import type { Metadata } from "next";
import { getCategoriesWithCount } from "@/features/category/queries";
import { CategoryManager } from "@/features/category/components/CategoryManager";

export const metadata: Metadata = {
  title: "Kelola Kategori",
};

// Login & role ADMIN sudah dijaga src/app/admin/layout.tsx.
export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCount();

  return (
    <main className="p-8">
      <div className="max-w-6xl mx-auto rounded-lg p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold border-b pb-4 mb-6">
          Kelola Kategori
        </h1>

        <CategoryManager categories={categories} />
      </div>
    </main>
  );
}
