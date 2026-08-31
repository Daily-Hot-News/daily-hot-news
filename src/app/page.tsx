import { getCategories } from "@/features/category/queries";
import { CategoryList } from "@/features/category/components/CategoryList";
import { CategoryForm } from "@/features/category/components/CategoryForm";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto rounded-lg p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold mb-6 border-b pb-4">
          Manage Categories
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-10">
          <div>
            <h2 className="text-lg font-semibold mb-4">Create New Category</h2>
            <CategoryForm categories={categories} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Existing Categories</h2>
            <CategoryList categories={categories} />
          </div>
        </div>
      </div>
    </main>
  );
}
