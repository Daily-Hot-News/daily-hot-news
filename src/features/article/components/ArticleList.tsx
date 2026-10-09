"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteArticle } from "../actions";
import { formatArticleDate } from "@/components/ArticleCard";
import type { ArticleAdminRow } from "../types";

const STATUS_BADGES: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  SCHEDULED: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-zinc-200 text-zinc-600",
};

export function ArticleList({ articles }: { articles: ArticleAdminRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(id);
      if (result?.error) setError(result.error);
      setConfirmingId(null);
    });
  }

  if (articles.length === 0) {
    return (
      <div className="p-4 text-zinc-500 border border-zinc-200 rounded">
        Belum ada artikel.{" "}
        <Link href="/admin/articles/new" className="text-blue-600 underline">
          Tulis yang pertama
        </Link>
        .
      </div>
    );
  }

  const th =
    "px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div role="alert" className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 border border-zinc-200 rounded">
          <thead>
            <tr>
              <th className={th}>Judul</th>
              <th className={th}>Kategori</th>
              <th className={th}>Status</th>
              <th className={th}>Tayang</th>
              <th className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-zinc-50">
                <td className={`${td} font-medium text-zinc-900`}>
                  {article.status === "PUBLISHED" ? (
                    <Link
                      href={`/artikel/${article.slug}`}
                      className="hover:underline"
                    >
                      {article.title}
                    </Link>
                  ) : (
                    article.title
                  )}
                  <span className="block text-xs text-zinc-400 font-mono font-normal">
                    {article.slug}
                  </span>
                </td>
                <td className={`${td} text-zinc-500`}>
                  {article.category.name}
                </td>
                <td className={td}>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_BADGES[article.status] ?? "bg-zinc-100"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className={`${td} text-zinc-500`}>
                  {article.publishedAt ? (
                    formatArticleDate(article.publishedAt)
                  ) : (
                    <span className="text-zinc-400 italic">—</span>
                  )}
                </td>
                <td className={`${td} text-right`}>
                  {confirmingId === article.id ? (
                    <span className="inline-flex items-center gap-3 justify-end">
                      <span className="text-zinc-600">Hapus?</span>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={isPending}
                        className="text-red-600 font-medium hover:underline disabled:opacity-50"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        disabled={isPending}
                        className="text-zinc-600 hover:underline disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setError(null);
                          setConfirmingId(article.id);
                        }}
                        disabled={isPending}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
