"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { SearchBar } from "@/features/search/components/SearchBar";
import { categoryAccent } from "@/lib/categoryAccent";

export type NavCategory = { name: string; slug: string };

type NavbarProps = {
  /** Kategori untuk strip menu. Dikirim dari root layout (server component). */
  categories?: NavCategory[];
  /**
   * Tanggal hari ini yang sudah diformat. Diformat di server dan dikirim ke
   * sini supaya teksnya identik antara HTML server dan render klien - kalau
   * dihitung di dalam komponen ini, hidrasi bisa mismatch.
   */
  todayLabel?: string;
};

export function Navbar({ categories = [], todayLabel }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Ambil User session Better-auth
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userRole = user?.role || "USER";

  // Close dropdown if clicked outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when route changed
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  };

  const roleBadgeStyles: Record<string, string> = {
    ADMIN: "bg-violet-100 text-violet-700 border border-violet-200", // Ungu untuk Admin
    USER: "bg-blue-100 text-blue-700 border border-blue-200", // Biru untuk User biasa
  };

  const isHome = pathname === "/";

  return (
    /*
     * Sticky dengan offset negatif setinggi pita atas (h-8): pita tanggalnya
     * ikut tergulung ke atas saat halaman di-scroll, sementara baris logo dan
     * strip kategori tetap menempel di tepi layar - pola yang dipakai hampir
     * semua portal berita.
     */
    <header className="sticky -top-8 z-50">
      {/* Pita atas: tanggal + tagline */}
      <div className="h-8 bg-linear-to-r from-red-700 via-red-600 to-orange-500 text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-3 px-4 text-[11px] font-medium sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
              Terkini
            </span>
            {todayLabel && <span className="truncate">{todayLabel}</span>}
          </div>
          <span className="hidden shrink-0 sm:inline">
            Kabar hangat, tiap hari.
          </span>
        </div>
      </div>

      <div className="border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
        {/* Baris utama: logo, pencarian, akun */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-4 md:h-16">
            {/* Logo / Brand */}
            <Link
              href="/"
              aria-label="Daily Hot News - beranda"
              className="flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-rose-500 text-sm font-extrabold text-white shadow-sm">
                DH
              </span>
              <span className="font-serif text-xl font-extrabold leading-none tracking-tight text-zinc-900 md:text-2xl">
                Daily<span className="text-red-600">Hot</span>News
              </span>
            </Link>

            {/* Pencarian ringkas (desktop) - lebar dipatok supaya tidak ikut
                menyusut/melebar mengikuti panjang placeholder. */}
            <div className="ml-auto hidden w-72 lg:block">
              <SearchBar variant="compact" />
            </div>

            {/* User Auth section for Desktop */}
            <div className="ml-auto hidden items-center gap-3 md:flex lg:ml-0">
              {userRole === "ADMIN" && (
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tulis
                </Link>
              )}

              {isPending ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200" />
              ) : user ? (
                /* Logged In: Profile Picture + Dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex cursor-pointer items-center gap-2 rounded-full p-1 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                    aria-expanded={isUserMenuOpen}
                  >
                    {/* Profile Pic or Fallback (initials) */}
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name || "User Avatar"}
                        className="h-8 w-8 rounded-full border border-zinc-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-red-600 to-rose-500 text-xs font-bold uppercase text-white shadow-sm">
                        {user.name ? user.name.charAt(0) : "U"}
                      </div>
                    )}
                    {/* Dropdown Icon */}
                    <svg
                      className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-60 divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-zinc-900/5">
                      {/* User & Role */}
                      <div className="bg-linear-to-br from-red-50 to-orange-50 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {user.name}
                        </p>
                        <p className="mb-1.5 truncate text-xs text-zinc-500">
                          {user.email}
                        </p>
                        {/* Badge Role */}
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            roleBadgeStyles[userRole] ||
                            "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {userRole}
                        </span>
                      </div>
                      {/* Menu Item Links */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          Profil Akun
                        </Link>
                        {/* Exclusive menu for ADMIN role */}
                        {userRole === "ADMIN" && (
                          <div>
                            <Link
                              href="/admin/articles/new"
                              className="block px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              Tulis Artikel Baru
                            </Link>
                            <Link
                              href="/admin/articles"
                              className="block px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              Dashboard Admin
                            </Link>
                          </div>
                        )}
                      </div>
                      {/* Logout Button*/}
                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          type="button"
                          className="w-full cursor-pointer px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not Logged In: Show Log In Button */
                <Link
                  href="/sign-in"
                  className="rounded-full bg-linear-to-r from-red-600 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="ml-auto flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-label={isOpen ? "Tutup menu" : "Buka menu"}
                aria-expanded={isOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Strip kategori - ciri khas portal berita. Digeser horizontal di layar kecil. */}
        {categories.length > 0 && (
          <nav
            aria-label="Kategori berita"
            className="border-t border-zinc-100 bg-white"
          >
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
              <ul className="no-scrollbar flex items-stretch gap-0.5 overflow-x-auto">
                <li className="shrink-0">
                  <Link
                    href="/"
                    aria-current={isHome ? "page" : undefined}
                    className={`flex h-10 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors ${
                      isHome
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-transparent text-zinc-700 hover:bg-zinc-50 hover:text-red-600"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-red-600"
                      aria-hidden
                    />
                    Terkini
                  </Link>
                </li>

                {categories.map((category) => {
                  const accent = categoryAccent(category.slug);
                  const href = `/kategori/${category.slug}`;
                  const isActive = pathname === href;

                  return (
                    <li key={category.slug} className="shrink-0">
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex h-10 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${
                          isActive
                            ? `${accent.border} ${accent.soft} ${accent.text} font-semibold`
                            : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
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
            </div>
          </nav>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="max-h-[calc(100vh-6rem)] space-y-4 overflow-y-auto border-b border-zinc-200 bg-white px-4 pb-5 pt-4 shadow-lg md:hidden">
          <SearchBar variant="compact" />

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                isHome
                  ? "bg-red-50 font-semibold text-red-700"
                  : "text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Cari Berita
            </Link>
          </div>

          {/* User Profile on Mobile Drawer */}
          <div className="border-t border-zinc-200 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-red-50 to-orange-50 px-3 py-2.5">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-red-600 to-rose-500 text-sm font-bold text-white">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {user.name}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        roleBadgeStyles[userRole] || "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {userRole}
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                  >
                    Profil Akun
                  </Link>
                  {userRole === "ADMIN" && (
                    <div>
                      <Link
                        href="/admin/articles/new"
                        className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        Tulis Artikel Baru
                      </Link>
                      <Link
                        href="/admin/articles"
                        className="block rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        Dashboard Admin
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className="w-full cursor-pointer border-t border-zinc-200 px-3 pt-4 text-left text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="block rounded-full bg-linear-to-r from-red-600 to-rose-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
