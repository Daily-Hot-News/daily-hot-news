import type { Metadata } from "next";
import Link from "next/link";
import { listArticlesForAdmin } from "@/features/article/queries";
import { ArticleList } from "@/features/article/components/ArticleList";
import { Pagination } from "@/components/Pagination";
import { PER_PAGE, parsePageParam } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Kelola Artikel",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Login & role ADMIN sudah dijaga src/app/admin/layout.tsx.
export default async function AdminArticlesPage({ searchParams }: Props) {
  const page = parsePageParam((await searchParams).page);
  const { articles, total } = await listArticlesForAdmin({
    page,
    perPage: PER_PAGE,
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="p-8">
      <div className="max-w-6xl mx-auto rounded-lg p-6 border border-zinc-200">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">
            Kelola Artikel
            <span className="ml-2 text-sm font-normal text-zinc-500 tabular-nums">
              {total} total
            </span>
          </h1>
          <Link
            href="/admin/articles/new"
            className="bg-zinc-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-zinc-800"
          >
            Tulis Artikel
          </Link>
        </div>

        <ArticleList articles={articles} />

        <Pagination
          page={page}
          totalPages={totalPages}
          hrefFor={(n) =>
            n === 1 ? "/admin/articles" : `/admin/articles?page=${n}`
          }
        />
      </div>
    </main>
  );
}
