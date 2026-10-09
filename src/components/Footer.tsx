import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { categoryAccent } from "@/lib/categoryAccent";
import type { NavCategory } from "@/components/Navbar";

type FooterProps = {
  categories?: NavCategory[];
};

/** Footer publik. Komponen server - isinya statis plus daftar kategori. */
export function Footer({ categories = [] }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-4 border-red-600 bg-zinc-900 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-rose-500 text-sm font-extrabold text-white">
              DH
            </span>
            <span className="font-serif text-xl font-extrabold tracking-tight text-white">
              Daily<span className="text-red-500">Hot</span>News
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            Kabar hangat dari berbagai topik, dirangkum singkat dan terbit tiap
            hari.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Kategori
          </h2>
          {categories.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Belum ada kategori.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {categories.map((category) => {
                const accent = categoryAccent(category.slug);
                return (
                  <li key={category.slug}>
                    <Link
                      href={`/kategori/${category.slug}`}
                      className="group inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                        aria-hidden
                      />
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Jelajahi
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Berita Terkini
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Cari Berita
              </Link>
            </li>
            <li>
              <Link
                href="/profile"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Profil Akun
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-zinc-500 sm:px-6 lg:px-8">
          &copy; {year} {SITE_NAME}. Seluruh konten dikelola redaksi.
        </div>
      </div>
    </footer>
  );
}
