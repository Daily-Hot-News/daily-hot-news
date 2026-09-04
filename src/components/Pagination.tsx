import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Bangun URL untuk nomor halaman tertentu. */
  hrefFor: (page: number) => string;
};

/**
 * Paginasi berbasis <Link>, bukan tombol - jadi tetap berfungsi tanpa
 * JavaScript, bisa dibuka di tab baru, dan halamannya ikut ter-index mesin
 * pencari. Komponen server, tidak perlu "use client".
 */
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Tampilkan maksimal 5 nomor di sekitar halaman aktif.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const linkClass =
    "px-3 py-1.5 text-sm border border-zinc-300 rounded hover:bg-zinc-100";

  return (
    <nav aria-label="Navigasi halaman" className="flex items-center gap-1 mt-8">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          Sebelumnya
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? "px-3 py-1.5 text-sm border border-zinc-900 bg-zinc-900 text-white rounded"
              : linkClass
          }
        >
          {p}
        </Link>
      ))}

      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          Berikutnya
        </Link>
      )}
    </nav>
  );
}
