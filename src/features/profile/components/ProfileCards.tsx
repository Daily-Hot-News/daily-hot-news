"use client";

import { useState } from "react";
import Link from "next/link";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    image: string | null;
    role: "USER" | "AUTHOR";
    emailVerified: boolean;
    createdAt: Date;
    _count?: {
      articles: number;
      comments: number;
    };
  };
}

const roleBadgeStyles: Record<string, string> = {
  AUTHOR: "bg-purple-100 text-purple-700 border border-purple-200", // Ungu untuk Author
  USER: "bg-blue-100 text-blue-700 border border-blue-200", // Biru untuk User biasa
};

const headerBannerStyles: Record<string, string> = {
  AUTHOR: "h-28 bg-linear-to-r from-indigo-600 to-blue-700 relative", // untuk Author
  USER: "h-28 bg-linear-to-r from-blue-600 to-indigo-700 relative", // untuk User biasa
};

export function ProfileCard({ user }: ProfileCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Format tanggal bergabung (contoh: 14 September 2026)
  const memberSince = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="bg-zinc-50/50 py-4 sm:py-20 px-4 sm:px-6">
      <div className="p-4 sm:p-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          {/* Header Banner Hiasan */}
          <div
            className={`${headerBannerStyles[user.role] || "h-28 bg-linear-to-r from-gray-600 to-gray-100 relative"}`}
          />

          {/* Konten Utama Profil */}
          <div className="px-6 pb-6 pt-0">
            <div className="relative flex justify-between items-end -mt-12 mb-4">
              {/* Avatar User / Fallback Inisial */}
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-blue-600 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-md">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                )}
              </div>

              {/* Badge Role */}
              <div>
                <span
                  className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full tracking-wider border ${
                    roleBadgeStyles[user.role] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* Informasi Nama & Email */}
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold text-zinc-900">{user.name}</h1>
              <div className="flex items-center gap-2 text-zinc-600 text-sm">
                <span>{user.email}</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    ✓ Terverifikasi
                  </span>
                ) : (
                  <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Belum Terverifikasi
                  </span>
                )}
              </div>
            </div>

            {/* Grid Detail Akun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-zinc-100 text-sm mb-6">
              <div>
                <span className="text-zinc-500 block text-xs">
                  Bergabung Sejak
                </span>
                <span className="font-medium text-zinc-800">{memberSince}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs">Tipe Akun</span>
                <span className="font-medium text-zinc-800">
                  {user.role === "AUTHOR"
                    ? "Penulis Berita (Author)"
                    : "Pembaca (User)"}
                </span>
              </div>
              {user.role === "AUTHOR" && user._count && (
                <div>
                  <span className="text-zinc-500 block text-xs">
                    Total Artikel
                  </span>
                  <span className="font-medium text-zinc-800">
                    {user._count.articles} artikel diterbitkan
                  </span>
                </div>
              )}
            </div>

            {/* Tombol Aksi / Navigasi Cepat */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Profil
              </button>

              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>

            {/* Modal Edit Profil */}
            <EditProfileModal
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
