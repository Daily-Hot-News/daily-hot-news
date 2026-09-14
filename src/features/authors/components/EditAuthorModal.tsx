"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateAuthorProfile } from "../actions";

interface EditAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorProfile: {
    displayName: string;
    jobTitle?: string | null;
    bio?: string | null;
  };
}

export function EditAuthorModal({
  isOpen,
  onClose,
  authorProfile,
}: EditAuthorModalProps) {
  const [displayName, setDisplayName] = useState(authorProfile.displayName);
  const [jobTitle, setJobTitle] = useState(authorProfile.jobTitle || "");
  const [bio, setBio] = useState(authorProfile.bio || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset state jika prop authorProfile berubah
  useEffect(() => {
    setDisplayName(authorProfile.displayName);
    setJobTitle(authorProfile.jobTitle || "");
    setBio(authorProfile.bio || "");
    setError(null);
  }, [authorProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateAuthorProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-5">
          <h3 className="text-lg font-bold text-zinc-900">
            Edit Profil Author
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nama Tampilan (Author Name)
            </label>
            <input
              name="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-zinc-600 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan Nama"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Job Title / Jabatan
            </label>
            <input
              name="jobTitle"
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 text-zinc-600 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Senior Tech Journalist"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Bio / Deskripsi Penulis
            </label>
            <textarea
              name="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-zinc-600 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tuliskan bio singkat mengenai pengalaman Anda..."
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
