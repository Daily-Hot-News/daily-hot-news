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
      className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
    >
      <span>#{name}</span>
      {count !== undefined && (
        <span className="rounded-full bg-white/70 px-1.5 text-xs font-semibold tabular-nums text-blue-600">
          {count}
        </span>
      )}
    </Link>
  );
}
