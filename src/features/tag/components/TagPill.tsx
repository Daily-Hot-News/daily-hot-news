import Link from "next/link";

type TagPillProps = {
  name: string;
  slug: string;
  count?: number;
};

/** Pill tag untuk halaman publik. Sengaja komponen server - tidak butuh state. */
export function TagPill({ name, slug, count }: TagPillProps) {
  return (
    <Link
      href={`/tag/${slug}`}
      className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-zinc-100 text-zinc-700 rounded-full hover:bg-zinc-200 transition-colors"
    >
      <span>#{name}</span>
      {count !== undefined && (
        <span className="text-xs text-zinc-500 tabular-nums">{count}</span>
      )}
    </Link>
  );
}
