import { Prisma } from "@prisma/client";

/**
 * Bentuk balikan seragam untuk semua server action di slice ini.
 * Kedua varian mendeklarasikan `error` supaya komponen bisa langsung
 * mengecek `result.error` tanpa narrowing manual.
 */
export type ActionResult =
  | { success: true; error?: undefined }
  | { success?: undefined; error: string };

export const ok = (): ActionResult => ({ success: true });
export const fail = (error: string): ActionResult => ({ error });

/**
 * Terjemahkan error Prisma jadi pesan yang bisa dibaca user.
 * Detail teknisnya tetap di-log ke server, tidak dibocorkan ke browser.
 */
export function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "Slug tersebut sudah dipakai. Gunakan slug lain.";
      case "P2003":
        return "Data ini masih dipakai oleh data lain, jadi tidak bisa dihapus.";
      case "P2025":
        return "Data tidak ditemukan. Mungkin sudah dihapus orang lain.";
    }
  }
  return fallback;
}
