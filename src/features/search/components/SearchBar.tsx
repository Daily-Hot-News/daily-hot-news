"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SearchBarProps = {
  /** Nilai awal, dipakai halaman /search supaya kotaknya tidak kosong saat reload. */
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
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

  return (
    <form
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      role="search"
      className="flex gap-2 w-full max-w-xl"
    >
      <label htmlFor="site-search" className="sr-only">
        Cari berita
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 border border-zinc-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-zinc-900 text-white rounded px-5 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? "Mencari..." : "Cari"}
      </button>
    </form>
  );
}
