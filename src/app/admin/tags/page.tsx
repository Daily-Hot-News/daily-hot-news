import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/authorize";
import { getTags } from "@/features/tag/queries";
import { TagManager } from "@/features/tag/components/TagManager";

export const metadata: Metadata = {
  title: "Kelola Tag",
  robots: { index: false, follow: false },
};

export default async function AdminTagsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (user.role !== "AUTHOR") {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-md mx-auto border border-zinc-200 rounded-lg p-6">
          <h1 className="text-lg font-semibold mb-2">Akses ditolak</h1>
          <p className="text-sm text-zinc-600">
            Halaman ini hanya untuk akun dengan role AUTHOR.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  const tags = await getTags();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto rounded-lg p-6 border border-zinc-200">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Kelola Tag</h1>
          <Link
            href="/admin/categories"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Kelola Kategori
          </Link>
        </div>

        <TagManager tags={tags} />
      </div>
    </main>
  );
}
