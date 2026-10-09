import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getArticleForEdit,
  getArticleFormOptions,
} from "@/features/article/queries";
import { ArticleForm } from "@/features/article/components/ArticleForm";

export const metadata: Metadata = {
  title: "Edit Artikel",
};

type Props = {
  params: Promise<{ id: string }>;
};

// Login & role ADMIN sudah dijaga src/app/admin/layout.tsx.
export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const [article, options] = await Promise.all([
    getArticleForEdit(id),
    getArticleFormOptions(),
  ]);

  if (!article) notFound();

  return (
    <main className="p-8">
      <div className="max-w-3xl mx-auto rounded-lg p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold border-b pb-4 mb-6">Edit Artikel</h1>

        <ArticleForm initialData={article} options={options} />
      </div>
    </main>
  );
}
