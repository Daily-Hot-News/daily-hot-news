"use client";

import { useState, useTransition } from "react";
import { deleteTag } from "../actions";
import type { TagWithCount } from "../types";

type TagListProps = {
  tags: TagWithCount[];
  onEdit: (tag: TagWithCount) => void;
  editingId?: string | null;
};

export function TagList({ tags, onEdit, editingId }: TagListProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteTag(id);
      if (result?.error) setError(result.error);
      setConfirmingId(null);
    });
  }

  if (tags.length === 0) {
    return (
      <div className="p-4 text-zinc-500 border border-zinc-200 rounded">
        Belum ada tag.
      </div>
    );
  }

  const th =
    "px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-100 text-red-700 rounded text-sm"
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 border border-zinc-200 rounded">
          <thead>
            <tr>
              <th className={th}>Nama</th>
              <th className={th}>Slug</th>
              <th className={th}>Artikel</th>
              <th className={`${th} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {tags.map((tag) => (
              <tr
                key={tag.id}
                className={
                  tag.id === editingId ? "bg-blue-50" : "hover:bg-zinc-50"
                }
              >
                <td className={`${td} font-medium text-zinc-900`}>
                  {tag.name}
                </td>
                <td className={`${td} text-zinc-500 font-mono text-xs`}>
                  {tag.slug}
                </td>
                <td className={`${td} text-zinc-500 tabular-nums`}>
                  {tag._count.articles}
                </td>
                <td className={`${td} text-right`}>
                  {confirmingId === tag.id ? (
                    <span className="inline-flex items-center gap-3 justify-end">
                      <span className="text-zinc-600">
                        {tag._count.articles > 0
                          ? `Lepas dari ${tag._count.articles} artikel?`
                          : "Hapus?"}
                      </span>
                      <button
                        onClick={() => handleDelete(tag.id)}
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
                      <button
                        onClick={() => onEdit(tag)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setError(null);
                          setConfirmingId(tag.id);
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
