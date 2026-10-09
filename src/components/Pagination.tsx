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
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700";

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-10 flex flex-wrap items-center gap-2"
    >
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
              ? "inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-rose-500 px-3 text-sm font-bold text-white shadow-sm"
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
