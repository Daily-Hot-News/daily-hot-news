"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// =============================================================================
// 📝 PANDUAN MIGRASI KE SUPABASE STORAGE (KETIKA NANTI SIAP DEPLOY):
// =============================================================================
// 1. Install SDK Supabase di terminal:
//    npm install @supabase/supabase-js
//
// 2. Buat Bucket di Supabase Dashboard -> Storage -> New Bucket:
//    - Beri nama: "avatars"
//    - Centang: "Public bucket" (agar fotonya bisa dilihat oleh pengunjung)
//
// 3. Tambahkan ke file .env:
//    NEXT_PUBLIC_SUPABASE_URL="https://project-id.supabase.co"
//    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
//
// 4. Di file ini, ganti blok kode [LANGKAH PENYIMPANAN LOKAL] dengan:
//
//    /* --- CONTOH KODE SUPABASE STORAGE ---
//    import { createClient } from "@supabase/supabase-js";
//    const supabase = createClient(
//      process.env.NEXT_PUBLIC_SUPABASE_URL!,
//      process.env.SUPABASE_SERVICE_ROLE_KEY!
//    );
//
//    const fileExt = avatar.name.split(".").pop() || "png";
//    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
//
//    const { error: uploadError } = await supabase.storage
//      .from("avatars")
//      .upload(fileName, buffer, {
//        contentType: avatar.type,
//        upsert: true,
//      });
//
//    if (uploadError) {
//      return { error: `Gagal upload ke Supabase: ${uploadError.message}` };
//    }
//
//    const { data: { publicUrl } } = supabase.storage
//      .from("avatars")
//      .getPublicUrl(fileName);
//
//    imageUrl = publicUrl; // Menggunakan URL CDN Supabase
//    -------------------------------------------------- */
// =============================================================================

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    const name = (formData.get("name") as string)?.trim();
    const avatar = formData.get("avatar") as File | null;

    if (!name) {
      return { error: "Nama tidak boleh kosong." };
    }

    let imageUrl: string | undefined = undefined;

    // Jika user memilih file avatar baru
    if (avatar && avatar.size > 0) {
      // 1. Validasi tipe file
      if (!avatar.type.startsWith("image/")) {
        return { error: "File yang dipilih harus berupa gambar (JPG, PNG, WebP)." };
      }

      // 2. Validasi batas ukuran file (maksimal 2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
      if (avatar.size > MAX_FILE_SIZE) {
        return { error: "Ukuran foto terlalu besar! Maksimal 2MB." };
      }

      const bytes = await avatar.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // =======================================================================
      // [LANGKAH PENYIMPANAN LOKAL SEMENTARA]
      // Simpan file ke folder: public/uploads/avatars/
      // =======================================================================
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(uploadDir, { recursive: true });

      const fileExt = avatar.name.split(".").pop() || "png";
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      // URL lokal yang bisa diakses langsung di browser (Next.js public folder)
      imageUrl = `/uploads/avatars/${fileName}`;
      // =======================================================================
    }

    // Update data di database PostgreSQL via Prisma
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    });

    // Revalidate halaman profil dan navbar agar data langsung ter-refresh
    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui profil:", error);
    return { error: error.message || "Terjadi kesalahan saat memperbarui profil." };
  }
}
