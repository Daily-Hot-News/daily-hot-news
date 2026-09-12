"use client";

import { useState } from "react";
import { TagForm } from "./TagForm";
import { TagList } from "./TagList";
import type { TagWithCount } from "../types";

export function TagManager({ tags }: { tags: TagWithCount[] }) {
  const [editing, setEditing] = useState<TagWithCount | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-10">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {editing ? `Edit "${editing.name}"` : "Buat Tag Baru"}
        </h2>
        <TagForm
          key={editing?.id ?? "create"}
          initialData={editing}
          onSuccess={() => setEditing(null)}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Daftar Tag</h2>
        <TagList tags={tags} onEdit={setEditing} editingId={editing?.id} />
      </div>
    </div>
  );
}
