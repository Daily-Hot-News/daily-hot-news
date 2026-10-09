import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Tombol aksi utama. Warnanya mengikuti merah brand yang dipakai navbar.
 *
 * Catatan: string kelasnya sebelumnya dibuka dan ditutup tanda kutip di dalam
 * template literal (`"mt-2 ... relativez-10"`), jadi kelas pertama dan
 * terakhirnya tidak valid - `mt-2` dan `relative`/`z-10` tidak pernah
 * benar-benar aktif. Sekarang ditulis bersih.
 */
export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`cursor-pointer rounded-lg bg-linear-to-r from-red-600 to-rose-500 px-4 py-2.5 font-semibold text-white shadow-sm transition-opacity duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
