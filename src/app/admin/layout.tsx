import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/authorize";

/**
 * Berlaku untuk semua halaman di bawah /admin. Halaman anak hanya perlu
 * menyetel `title` sendiri - `robots` sudah diwarisi dari sini.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/admin/articles", label: "Artikel" },
  { href: "/admin/categories", label: "Kategori" },
  { href: "/admin/tags", label: "Tag" },
  { href: "/admin/newsletters", label: "Newsletter" },
];

/**
 * Satu-satunya tempat pengecekan role untuk area admin.
 *
 * Sebelumnya blok "Akses ditolak" ini di-copy ke tiap halaman admin, jadi
 * halaman baru mudah lupa memasangnya. Perlu dicatat: layout hanya menjaga
 * tampilan - server action tetap wajib memanggil `requireAdmin()` sendiri,
 * karena action bisa dipanggil lewat POST langsung tanpa melewati layout ini.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (user.role !== "ADMIN") {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-md mx-auto border border-zinc-200 rounded-lg p-6">
          <h1 className="text-lg font-semibold mb-2">Akses ditolak</h1>
          <p className="text-sm text-zinc-600">
            Halaman ini hanya untuk akun dengan role ADMIN.
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

  return (
    <div className="min-h-screen">
      <nav className="border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-8 flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </div>
  );
}
