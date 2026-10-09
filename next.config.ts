import type { NextConfig } from "next";

/**
 * Host Supabase Storage, diturunkan dari SUPABASE_URL.
 *
 * Tidak di-hardcode supaya tidak ikut salah saat project Supabase-nya berbeda
 * (mis. staging vs produksi), dan tidak bikin `next build` gagal kalau envnya
 * memang belum diisi - tanpa host ini next/image cuma menolak URL remote.
 */
const supabaseHostname = (() => {
  const raw = process.env.SUPABASE_URL;
  if (!raw) return null;

  try {
    return new URL(raw).hostname;
  } catch {
    console.warn("SUPABASE_URL bukan URL yang valid, diabaikan.");
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    // Hanya objek publik di bucket yang boleh dioptimasi next/image, bukan
    // seluruh host - pathname yang terbuka lebar memperbolehkan URL yang tidak
    // pernah kita maksudkan untuk dilewatkan optimizer.
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },

  experimental: {
    serverActions: {
      // Gambar sampul dikirim lewat server action (uploadImage), dan batas
      // bawaannya cuma 1MB. Harus lebih besar dari MAX_IMAGE_BYTES
      // (src/features/media/types.ts) plus ongkos multipart ~10-20KB, kalau
      // tidak uploadnya ditolak Next.js sebelum actionnya jalan.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
