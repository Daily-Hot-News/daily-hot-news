"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { updateProfile } from "../actions";
import { authClient } from "@/lib/authClient";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [previewImage, setPreviewImage] = useState<string | null>(user.image);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refetch } = authClient.useSession();

  // Sync state ketika user prop berubah
  useEffect(() => {
    setName(user.name);
    setPreviewImage(user.image);
    setError(null);
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Tangani saat user memilih file gambar baru
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("Harap pilih file gambar (JPG, PNG, atau WebP).");
      return;
    }

    // Validasi batas ukuran file (maksimal 2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setError(
        "Ukuran foto maksimal 2MB! Silakan pilih foto yang lebih kecil.",
      );
      e.target.value = ""; // Reset input file
      return;
    }

    // Buat URL preview sementara di browser
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setError(null);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        await refetch();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-5">
          <h3 className="text-lg font-bold text-zinc-900">Edit Profil Akun</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <svg
              className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview & Tombol Ganti */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative group">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview Foto"
                  className="w-24 h-24 rounded-full object-cover border-2 border-zinc-200 shadow-xs"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-xs">
                  {name ? name.charAt(0) : "U"}
                </div>
              )}

              {/* Overlay hover untuk ganti foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium cursor-pointer"
              >
                Ubah
              </button>
            </div>

            {/* Input file disembunyikan */}
            <input
              ref={fileInputRef}
              type="file"
              name="avatar"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleImageChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 cursor-pointer"
            >
              Pilih Foto Baru (Maks 2MB)
            </button>
          </div>

          {/* Input Nama Lengkap */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-zinc-700 mb-1"
            >
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Masukkan nama Anda"
            />
          </div>

          {/* Input Email (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Alamat Email (Terkunci)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 text-sm border border-zinc-200 bg-zinc-50 text-zinc-500 rounded-lg cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Email digunakan untuk autentikasi dan tidak dapat diubah di sini.
            </p>
          </div>

          {/* Tombol Batal & Simpan */}
          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
