import { headers } from "next/headers";
import type { UserRole } from "@prisma/client";
import { auth } from "./auth";
import { prisma } from "./prisma";

export type CurrentUser = { id: string; role: UserRole };

/**
 * Ambil user yang sedang login beserta rolenya.
 *
 * Role diambil ulang dari database, bukan dari `session.user`, karena Better-Auth
 * di src/lib/auth.ts belum mendaftarkan `role` sebagai additionalFields - jadi
 * `session.user.role` selalu undefined. Kalau nanti Dev A menambahkannya,
 * query kedua di sini bisa dihapus.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
}

export type AuthzResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; error: string };

/**
 * Guard untuk server action yang mengubah data (Category, Tag).
 * Dipakai sebagai baris pertama di setiap action mutasi.
 */
export async function requireAuthor(): Promise<AuthzResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "Anda harus login terlebih dahulu." };
  }
  if (user.role !== "AUTHOR") {
    return {
      ok: false,
      error: "Akses ditolak. Hanya AUTHOR yang boleh mengubah data ini.",
    };
  }

  return { ok: true, user };
}
