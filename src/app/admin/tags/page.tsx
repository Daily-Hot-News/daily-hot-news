import type { Metadata } from "next";
import { getTags } from "@/features/tag/queries";
import { TagManager } from "@/features/tag/components/TagManager";

export const metadata: Metadata = {
  title: "Kelola Tag",
};

// Login & role ADMIN sudah dijaga src/app/admin/layout.tsx.
export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <main className="p-8">
      <div className="max-w-6xl mx-auto rounded-lg p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold border-b pb-4 mb-6">Kelola Tag</h1>

        <TagManager tags={tags} />
      </div>
    </main>
  );
}
