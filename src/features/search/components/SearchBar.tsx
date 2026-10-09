"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

type SearchBarProps = {
  /** Nilai awal, dipakai halaman /search supaya kotaknya tidak kosong saat reload. */
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  /**
   * "hero" untuk kotak besar di halaman, "compact" untuk yang menempel di
   * navbar. Keduanya form yang sama - cuma tampilannya yang beda.
   */
  variant?: "hero" | "compact";
};

/**
 * Tetap berupa <form method="get" action="/search"> yang sungguhan, jadi kalau
 * JavaScript gagal dimuat pencarian masih jalan lewat navigasi biasa. Handler
 * di bawah hanya "meningkatkan" jadi navigasi sisi klien.
 */
export function SearchBar({
  defaultValue = "",
  placeholder = "Cari berita...",
  autoFocus = false,
  variant = "hero",
}: SearchBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const query = value.trim();
    if (!query) return; // biarkan form kosong tidak melakukan apa-apa

    event.preventDefault();
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    });
  }

  const isCompact = variant === "compact";
  // Satu halaman bisa memuat beberapa SearchBar sekaligus (navbar + drawer +
  // isi halaman), jadi id-nya tidak boleh hardcode - label harus tetap
  // menunjuk ke input-nya sendiri.
  const inputId = useId();

  return (
    <form
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      role="search"
      className={
        isCompact
          ? "relative w-full max-w-xs"
          : "relative flex w-full max-w-xl gap-2"
      }
    >
      <label htmlFor={inputId} className="sr-only">
        Cari berita
      </label>

      {isCompact ? (
        <>
          <input
            id={inputId}
            name="q"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="Cari berita"
            className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              id={inputId}
              name="q"
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 cursor-pointer rounded-full bg-linear-to-r from-red-600 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? "Mencari..." : "Cari"}
          </button>
        </>
      )}
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
      />
    </svg>
  );
}
