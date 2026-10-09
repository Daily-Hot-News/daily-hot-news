/**
 * Pembungkus tipis Storage REST API Supabase.
 *
 * Sengaja pakai `fetch` biasa, bukan @supabase/supabase-js: yang dibutuhkan
 * cuma tiga hal - upload objek, hapus objek, dan menyusun URL publiknya - jadi
 * menambah SDK beserta dependensinya tidak sebanding.
 *
 * SUPABASE_SERVICE_ROLE_KEY melewati RLS, jadi modul ini HANYA boleh dipanggil
 * dari server (server action / route handler). Nama variabel envnya sengaja
 * tanpa prefix NEXT_PUBLIC_ supaya tidak mungkin ikut ter-bundle ke browser.
 */

/** Error yang pesannya memang sudah ditulis untuk ditampilkan ke admin. */
export class StorageError extends Error {}

export type UploadedObject = {
  /** Path objek di dalam bucket, mis. "2026/10/<uuid>-foto.jpg". */
  path: string;
  /** URL publik yang disimpan ke kolom Media.url. */
  url: string;
};

/** Bucket tempat gambar artikel disimpan. Dibuat manual di dashboard Supabase. */
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "article-images";

/**
 * Nama bucket versi aman-URL. Supabase mengizinkan spasi di nama bucket
 * (mis. "media image"), dan nama itu masuk ke path URL - tanpa di-encode,
 * URL yang dihasilkan tidak valid.
 */
const BUCKET_SEGMENT = encodeURIComponent(BUCKET);

type StorageEnv = { baseUrl: string; serviceKey: string };

function readEnv(): StorageEnv | null {
  const baseUrl = process.env.SUPABASE_URL?.trim()
    // Trailing slash dibuang supaya penggabungan URL tidak menghasilkan "//".
    .replace(/\/+$/, "")
    // Halaman API di dashboard Supabase menampilkan URL yang sudah berakhiran
    // /rest/v1, dan itu yang biasanya ikut tercopy. Dipotong di sini supaya
    // tidak jadi .../rest/v1/storage/v1/... yang pasti 401 - kesalahan yang
    // pesan errornya sama sekali tidak menunjuk ke penyebabnya.
    .replace(/\/(rest|storage)\/v1$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!baseUrl || !serviceKey) return null;

  return { baseUrl, serviceKey };
}

/**
 * Header autentikasi untuk Storage API.
 *
 * `apikey` dan `Authorization` dikirim dua-duanya, persis seperti yang
 * dilakukan @supabase/supabase-js: service_role key format lama (JWT) diterima
 * lewat Authorization, sedangkan secret key format baru (`sb_secret_...`)
 * ditolak gateway dengan "No API key found in request" kalau header `apikey`
 * tidak ada.
 */
function authHeaders(serviceKey: string): Record<string, string> {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

/** Path objek boleh punya "/", tapi tiap segmennya tetap perlu di-encode. */
function encodeObjectPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

/**
 * Nama objek di bucket: `<tahun>/<bulan>/<uuid>-<nama-asli>.<ext>`
 *
 * Prefix tanggal menjaga isi bucket tetap bisa ditelusuri saat sudah berisi
 * ribuan file, dan bagian acak memastikan dua upload dengan nama file sama
 * tidak bertabrakan - upsert dimatikan, jadi tabrakan berarti upload gagal.
 */
function buildObjectPath(originalName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const dot = originalName.lastIndexOf(".");
  const rawBase = dot > 0 ? originalName.slice(0, dot) : originalName;
  const rawExt = dot > 0 ? originalName.slice(dot + 1) : "";

  const base =
    rawBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "gambar";
  const ext =
    rawExt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5) || "bin";

  return `${year}/${month}/${crypto.randomUUID()}-${base}.${ext}`;
}

function uploadErrorMessage(status: number): string {
  switch (status) {
    case 400:
    case 409:
      return "Nama file bentrok di bucket. Coba unggah ulang.";
    case 401:
    case 403:
      return "Akses ke Supabase Storage ditolak. Periksa SUPABASE_SERVICE_ROLE_KEY.";
    case 404:
      return `Bucket "${BUCKET}" tidak ada di Supabase Storage. Buat dulu bucketnya.`;
    case 413:
      return "Gambar ditolak Supabase karena melebihi batas ukuran bucket.";
    default:
      return "Upload gambar ke Supabase Storage gagal.";
  }
}

/**
 * Unggah satu gambar ke bucket dan kembalikan path serta URL publiknya.
 * Melempar StorageError kalau gagal - pesannya aman ditampilkan ke admin.
 */
export async function uploadImageObject(args: {
  body: ArrayBuffer;
  contentType: string;
  originalName: string;
}): Promise<UploadedObject> {
  const env = readEnv();
  if (!env) {
    throw new StorageError(
      "Supabase Storage belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.",
    );
  }

  const path = buildObjectPath(args.originalName);
  const encodedPath = encodeObjectPath(path);

  const response = await fetch(
    `${env.baseUrl}/storage/v1/object/${BUCKET_SEGMENT}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(env.serviceKey),
        "Content-Type": args.contentType,
        // Path mengandung uuid, jadi isi objeknya tidak akan pernah berubah -
        // aman di-cache lama di CDN dan di browser.
        "Cache-Control": "max-age=31536000",
        // Jangan sampai menimpa objek lain yang sudah ada di path yang sama.
        "x-upsert": "false",
      },
      body: args.body,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("uploadImageObject gagal:", response.status, detail);
    throw new StorageError(uploadErrorMessage(response.status));
  }

  return {
    path,
    url: `${env.baseUrl}/storage/v1/object/public/${BUCKET_SEGMENT}/${encodedPath}`,
  };
}

/**
 * Hapus satu objek dari bucket.
 *
 * Sengaja tidak melempar error: pemanggilnya selalu dalam posisi "bersih-bersih"
 * (baris Media sudah dihapus, atau gambarnya baru digantikan), dan file nganggur
 * di bucket bukan alasan untuk menggagalkan aksi yang sudah berhasil.
 * Balikannya dipakai untuk menandai bahwa file itu perlu disapu manual.
 */
export async function removeImageObject(path: string): Promise<boolean> {
  const env = readEnv();
  if (!env) return false;

  try {
    const response = await fetch(
      `${env.baseUrl}/storage/v1/object/${BUCKET_SEGMENT}/${encodeObjectPath(path)}`,
      {
        method: "DELETE",
        headers: authHeaders(env.serviceKey),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "removeImageObject gagal:",
        response.status,
        await response.text().catch(() => ""),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("removeImageObject gagal:", error);
    return false;
  }
}
