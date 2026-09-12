/**
 * Seed data untuk pengembangan slice Dev C (Category, Tag, Search, Sitemap).
 *
 * Fitur Article milik Dev B belum ada, sementara pencarian dan sitemap tidak
 * bisa diuji tanpa artikel. Script ini mengisi artikel karangan seperlunya -
 * termasuk yang DRAFT dan SCHEDULED, supaya bisa dibuktikan bahwa artikel
 * belum tayang memang tidak bocor ke hasil pencarian maupun sitemap.
 *
 * Idempotent (semua upsert), aman dijalankan berkali-kali:
 *   npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const AUTHOR_ID = "seed-author-devc";

const CATEGORIES = [
  { slug: "politik", name: "Politik", description: "Kabar politik nasional dan daerah." },
  { slug: "ekonomi", name: "Ekonomi", description: "Perekonomian, pasar modal, dan dunia usaha." },
  { slug: "teknologi", name: "Teknologi", description: "Inovasi, gawai, dan dunia digital." },
  { slug: "olahraga", name: "Olahraga", description: "Sepak bola, bulu tangkis, dan cabang lainnya." },
  // Dua di bawah ini bersarang, untuk menguji hirarki dan breadcrumb.
  { slug: "ekonomi-makro", name: "Ekonomi Makro", parent: "ekonomi", description: "Inflasi, suku bunga, dan pertumbuhan." },
  { slug: "sepak-bola", name: "Sepak Bola", parent: "olahraga", description: "Liga domestik dan internasional." },
];

const TAGS = [
  "Pemilu", "APBN", "Inflasi", "Startup",
  "Kecerdasan Buatan", "Timnas", "Liga 1", "Suku Bunga",
];

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: "PUBLISHED" | "DRAFT" | "SCHEDULED";
  /** Hari relatif dari hari ini. Negatif = lampau, positif = masa depan. */
  dayOffset: number;
};

const ARTICLES: SeedArticle[] = [
  {
    slug: "bank-indonesia-tahan-suku-bunga-acuan",
    title: "Bank Indonesia Tahan Suku Bunga Acuan di Level 6 Persen",
    excerpt: "Keputusan diambil untuk menjaga stabilitas nilai tukar rupiah di tengah tekanan global.",
    content: "Rapat Dewan Gubernur Bank Indonesia memutuskan menahan suku bunga acuan pada level 6 persen. Gubernur BI menyatakan keputusan ini konsisten dengan upaya menjaga inflasi dalam sasaran dan menjaga stabilitas nilai tukar rupiah terhadap dolar Amerika Serikat. Pelaku pasar menilai langkah ini sudah diantisipasi sejak pekan lalu.",
    category: "ekonomi-makro",
    tags: ["Inflasi", "Suku Bunga"],
    status: "PUBLISHED",
    dayOffset: -1,
  },
  {
    slug: "inflasi-tahunan-melandai-di-bawah-target",
    title: "Inflasi Tahunan Melandai, Terendah dalam Dua Tahun Terakhir",
    excerpt: "Penurunan harga pangan bergejolak menjadi penyumbang utama melandainya inflasi.",
    content: "Badan Pusat Statistik melaporkan inflasi tahunan melandai ke level terendah dalam dua tahun terakhir. Komponen harga bergejolak, terutama cabai dan bawang, mencatat deflasi bulanan. Ekonom memperkirakan tren ini memberi ruang bagi pelonggaran kebijakan moneter pada kuartal mendatang.",
    category: "ekonomi-makro",
    tags: ["Inflasi", "APBN"],
    status: "PUBLISHED",
    dayOffset: -3,
  },
  {
    slug: "pemerintah-rancang-apbn-tahun-depan",
    title: "Pemerintah Rancang APBN Tahun Depan dengan Defisit Lebih Sempit",
    excerpt: "Belanja infrastruktur dipangkas, anggaran perlindungan sosial dinaikkan.",
    content: "Kementerian Keuangan memaparkan kerangka ekonomi makro dan pokok kebijakan fiskal untuk APBN tahun depan. Defisit dirancang lebih sempit dibanding tahun berjalan. Alokasi belanja infrastruktur dipangkas, sementara anggaran perlindungan sosial dan pendidikan mendapat tambahan.",
    category: "ekonomi",
    tags: ["APBN"],
    status: "PUBLISHED",
    dayOffset: -5,
  },
  {
    slug: "komisi-pemilihan-umum-tetapkan-jadwal-kampanye",
    title: "Komisi Pemilihan Umum Tetapkan Jadwal Kampanye",
    excerpt: "Masa kampanye berlangsung selama tujuh puluh lima hari sebelum hari pemungutan suara.",
    content: "Komisi Pemilihan Umum menetapkan jadwal tahapan pemilu, termasuk masa kampanye yang berlangsung selama tujuh puluh lima hari. Badan Pengawas Pemilu mengingatkan peserta agar mematuhi aturan pemasangan alat peraga kampanye di ruang publik.",
    category: "politik",
    tags: ["Pemilu"],
    status: "PUBLISHED",
    dayOffset: -2,
  },
  {
    slug: "partisipasi-pemilih-muda-diprediksi-meningkat",
    title: "Partisipasi Pemilih Muda Diprediksi Meningkat pada Pemilu Mendatang",
    excerpt: "Survei menunjukkan mayoritas pemilih pemula sudah menentukan pilihan.",
    content: "Lembaga survei merilis temuan bahwa partisipasi pemilih muda diprediksi meningkat dibanding pemilu sebelumnya. Mayoritas responden pemilih pemula mengaku sudah menentukan pilihan, dengan media sosial sebagai sumber informasi politik utama.",
    category: "politik",
    tags: ["Pemilu"],
    status: "PUBLISHED",
    dayOffset: -7,
  },
  {
    slug: "startup-lokal-kembangkan-model-kecerdasan-buatan",
    title: "Startup Lokal Kembangkan Model Kecerdasan Buatan Berbahasa Indonesia",
    excerpt: "Model dilatih dengan korpus teks berbahasa Indonesia dan sejumlah bahasa daerah.",
    content: "Sebuah startup teknologi asal Bandung memperkenalkan model kecerdasan buatan yang dilatih khusus dengan korpus teks berbahasa Indonesia serta beberapa bahasa daerah. Pendiri perusahaan menyebut model ini ditujukan untuk sektor layanan publik dan pendidikan.",
    category: "teknologi",
    tags: ["Startup", "Kecerdasan Buatan"],
    status: "PUBLISHED",
    dayOffset: -4,
  },
  {
    slug: "pendanaan-startup-teknologi-mulai-pulih",
    title: "Pendanaan Startup Teknologi Mulai Pulih Setelah Musim Dingin",
    excerpt: "Investor kembali menaruh minat, terutama pada sektor kesehatan digital.",
    content: "Nilai pendanaan startup teknologi di Asia Tenggara menunjukkan pemulihan setelah periode pengetatan yang panjang. Investor kembali menaruh minat, terutama pada sektor kesehatan digital dan kecerdasan buatan terapan.",
    category: "teknologi",
    tags: ["Startup"],
    status: "PUBLISHED",
    dayOffset: -9,
  },
  {
    slug: "timnas-indonesia-menang-di-kandang-lawan",
    title: "Timnas Indonesia Menang Tipis di Kandang Lawan",
    excerpt: "Gol tunggal di menit akhir memastikan tiga poin penting.",
    content: "Tim nasional Indonesia meraih kemenangan tipis di kandang lawan lewat gol tunggal pada menit akhir pertandingan. Pelatih menyebut hasil ini penting untuk menjaga peluang lolos ke babak berikutnya.",
    category: "sepak-bola",
    tags: ["Timnas"],
    status: "PUBLISHED",
    dayOffset: -1,
  },
  {
    slug: "jadwal-liga-1-dipadatkan",
    title: "Jadwal Liga 1 Dipadatkan Menjelang Jeda Internasional",
    excerpt: "Operator liga menjadwalkan pertandingan tengah pekan untuk mengejar kalender.",
    content: "Operator kompetisi memadatkan jadwal Liga 1 menjelang jeda internasional. Sejumlah klub mengeluhkan waktu pemulihan pemain yang menjadi lebih singkat akibat pertandingan tengah pekan.",
    category: "sepak-bola",
    tags: ["Liga 1"],
    status: "PUBLISHED",
    dayOffset: -6,
  },
  {
    slug: "bulu-tangkis-indonesia-rebut-gelar-ganda-putra",
    title: "Bulu Tangkis Indonesia Rebut Gelar Ganda Putra",
    excerpt: "Pasangan unggulan menang dua gim langsung di partai final.",
    content: "Pasangan ganda putra Indonesia merebut gelar juara setelah menang dua gim langsung di partai final. Kemenangan ini melengkapi capaian kontingen sepanjang musim.",
    category: "olahraga",
    tags: ["Timnas"],
    status: "PUBLISHED",
    dayOffset: -12,
  },

  // --- Tidak boleh muncul di pencarian maupun sitemap ---
  {
    slug: "draf-analisis-anggaran-daerah",
    title: "Draf: Analisis Anggaran Daerah yang Belum Selesai",
    excerpt: "Naskah ini belum selesai disunting.",
    content: "Naskah draf mengenai analisis anggaran daerah. Berisi kata kunci inflasi dan APBN, tetapi statusnya masih DRAFT sehingga tidak boleh muncul di hasil pencarian publik.",
    category: "ekonomi",
    tags: ["APBN"],
    status: "DRAFT",
    dayOffset: 0,
  },
  {
    slug: "draf-liputan-startup-belum-terbit",
    title: "Draf: Liputan Startup yang Belum Terbit",
    excerpt: "Menunggu konfirmasi narasumber.",
    content: "Naskah draf liputan startup dan kecerdasan buatan. Statusnya DRAFT, jadi harus tidak terlihat publik meskipun mengandung kata kunci yang sama dengan artikel tayang.",
    category: "teknologi",
    tags: ["Startup"],
    status: "DRAFT",
    dayOffset: 0,
  },
  {
    slug: "terjadwal-pengumuman-suku-bunga-berikutnya",
    title: "Terjadwal: Pengumuman Suku Bunga Berikutnya",
    excerpt: "Artikel ini dijadwalkan tayang pekan depan.",
    content: "Artikel terjadwal mengenai pengumuman suku bunga. publishedAt-nya di masa depan, jadi filter publishedAt <= now() harus menyembunyikannya sampai waktunya tiba.",
    category: "ekonomi-makro",
    tags: ["Suku Bunga"],
    status: "SCHEDULED",
    dayOffset: 7,
  },
];

function daysFromNow(offset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

function slugifyTag(name: string): string {
  return name
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const now = new Date();

  // --- Penulis ---
  await prisma.user.upsert({
    where: { id: AUTHOR_ID },
    update: { role: "AUTHOR" },
    create: {
      id: AUTHOR_ID,
      name: "Redaksi Daily Hot News",
      email: "redaksi@dailyhotnews.test",
      emailVerified: true,
      role: "AUTHOR",
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.authorProfile.upsert({
    where: { userId: AUTHOR_ID },
    update: {},
    create: {
      userId: AUTHOR_ID,
      displayName: "Redaksi",
      slug: "redaksi",
      jobTitle: "Tim Redaksi",
      bio: "Akun redaksi untuk data pengembangan.",
    },
  });

  // --- Kategori (induk dulu, baru anak) ---
  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES.filter((c) => !c.parent)) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
      },
    });
    categoryIds.set(category.slug, row.id);
  }
  for (const category of CATEGORIES.filter((c) => c.parent)) {
    const parentId = categoryIds.get(category.parent!);
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, parentId },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        parentId,
      },
    });
    categoryIds.set(category.slug, row.id);
  }

  // --- Tag ---
  const tagIds = new Map<string, string>();
  for (const name of TAGS) {
    const row = await prisma.tag.upsert({
      where: { slug: slugifyTag(name) },
      update: {},
      create: { name, slug: slugifyTag(name) },
    });
    tagIds.set(name, row.id);
  }

  // --- Artikel ---
  for (const article of ARTICLES) {
    const categoryId = categoryIds.get(article.category);
    if (!categoryId) throw new Error(`Kategori "${article.category}" tidak ada`);

    // DRAFT tidak punya publishedAt sama sekali; SCHEDULED punya tapi di masa depan.
    const publishedAt =
      article.status === "DRAFT" ? null : daysFromNow(article.dayOffset);

    const row = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        categoryId,
        status: article.status,
        publishedAt,
        scheduledAt: article.status === "SCHEDULED" ? publishedAt : null,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        authorId: AUTHOR_ID,
        categoryId,
        status: article.status,
        publishedAt,
        scheduledAt: article.status === "SCHEDULED" ? publishedAt : null,
      },
    });

    // Samakan kaitan tag: hapus yang lama, pasang sesuai definisi di atas.
    await prisma.articleTag.deleteMany({ where: { articleId: row.id } });
    await prisma.articleTag.createMany({
      data: article.tags.flatMap((name) => {
        const tagId = tagIds.get(name);
        return tagId ? [{ articleId: row.id, tagId }] : [];
      }),
      skipDuplicates: true,
    });
  }

  const published = ARTICLES.filter((a) => a.status === "PUBLISHED").length;
  console.log(
    `Seed selesai: ${CATEGORIES.length} kategori, ${TAGS.length} tag, ` +
    `${ARTICLES.length} artikel (${published} tayang, ${ARTICLES.length - published} sengaja disembunyikan).`,
  );
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
