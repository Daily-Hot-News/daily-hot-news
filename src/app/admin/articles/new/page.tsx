import type { Metadata } from "next";
import { getArticleFormOptions } from "@/features/article/queries";
import { ArticleForm } from "@/features/article/components/ArticleForm";

export const metadata: Metadata = {
  title: "Tulis Artikel",
};

// Login & role ADMIN sudah dijaga src/app/admin/layout.tsx.
export default async function NewArticlePage() {
  const options = await getArticleFormOptions();

  return (
    <main className="p-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold border-b pb-4 mb-6">Tulis Artikel</h1>

        <ArticleForm options={options} />
      </div>
    </main>
  );
}
