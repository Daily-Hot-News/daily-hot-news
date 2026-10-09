/**
 * Warna aksen per kategori.
 *
 * Model Category belum punya kolom warna, jadi warnanya ditentukan di sini:
 * dicocokkan dulu dari kata kunci pada slug (politik merah, ekonomi hijau,
 * olahraga biru - seperti pewarnaan rubrik di portal berita), dan kalau tidak
 * ada yang cocok baru jatuh ke hash slug. Hasilnya stabil: satu kategori
 * selalu dapat warna yang sama di navbar, kartu artikel, dan halaman arsipnya,
 * tanpa perlu migrasi database.
 *
 * Kelasnya ditulis utuh (bukan `bg-${color}-50`) karena Tailwind memindai
 * string literal di source; kelas yang dirangkai saat runtime tidak akan ikut
 * ter-generate.
 */
export type CategoryAccent = {
  /** Teks beraksen, mis. nama kategori di kartu artikel. */
  text: string;
  /** Versi group-hover dari `text`, untuk judul di dalam kartu. */
  groupHoverText: string;
  /** Badge lembut: latar + teks + border sekaligus. */
  badge: string;
  /** Blok padat, mis. pita judul halaman kategori. */
  solid: string;
  /** Latar sangat lembut untuk hover dan panel. */
  soft: string;
  /** Titik kecil penanda kategori di strip navbar. */
  dot: string;
  /** Warna garis, mis. garis bawah menu aktif. */
  border: string;
  /** Pasangan warna untuk bg-linear-*. */
  gradient: string;
};

const RED: CategoryAccent = {
  text: "text-red-600",
  groupHoverText: "group-hover:text-red-600",
  badge: "bg-red-50 text-red-700 border-red-200",
  solid: "bg-red-600 text-white",
  soft: "bg-red-50",
  dot: "bg-red-600",
  border: "border-red-500",
  gradient: "from-red-600 to-rose-500",
};

const BLUE: CategoryAccent = {
  text: "text-blue-600",
  groupHoverText: "group-hover:text-blue-600",
  badge: "bg-blue-50 text-blue-700 border-blue-200",
  solid: "bg-blue-600 text-white",
  soft: "bg-blue-50",
  dot: "bg-blue-600",
  border: "border-blue-500",
  gradient: "from-blue-600 to-sky-500",
};

const EMERALD: CategoryAccent = {
  text: "text-emerald-600",
  groupHoverText: "group-hover:text-emerald-600",
  badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  solid: "bg-emerald-600 text-white",
  soft: "bg-emerald-50",
  dot: "bg-emerald-600",
  border: "border-emerald-500",
  gradient: "from-emerald-600 to-teal-500",
};

const AMBER: CategoryAccent = {
  text: "text-amber-600",
  groupHoverText: "group-hover:text-amber-600",
  badge: "bg-amber-50 text-amber-700 border-amber-200",
  solid: "bg-amber-500 text-white",
  soft: "bg-amber-50",
  dot: "bg-amber-500",
  border: "border-amber-500",
  gradient: "from-amber-500 to-orange-500",
};

const VIOLET: CategoryAccent = {
  text: "text-violet-600",
  groupHoverText: "group-hover:text-violet-600",
  badge: "bg-violet-50 text-violet-700 border-violet-200",
  solid: "bg-violet-600 text-white",
  soft: "bg-violet-50",
  dot: "bg-violet-600",
  border: "border-violet-500",
  gradient: "from-violet-600 to-purple-500",
};

const CYAN: CategoryAccent = {
  text: "text-cyan-600",
  groupHoverText: "group-hover:text-cyan-600",
  badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
  solid: "bg-cyan-600 text-white",
  soft: "bg-cyan-50",
  dot: "bg-cyan-600",
  border: "border-cyan-500",
  gradient: "from-cyan-600 to-sky-500",
};

const PINK: CategoryAccent = {
  text: "text-pink-600",
  groupHoverText: "group-hover:text-pink-600",
  badge: "bg-pink-50 text-pink-700 border-pink-200",
  solid: "bg-pink-600 text-white",
  soft: "bg-pink-50",
  dot: "bg-pink-600",
  border: "border-pink-500",
  gradient: "from-pink-600 to-rose-500",
};

const INDIGO: CategoryAccent = {
  text: "text-indigo-600",
  groupHoverText: "group-hover:text-indigo-600",
  badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  solid: "bg-indigo-600 text-white",
  soft: "bg-indigo-50",
  dot: "bg-indigo-600",
  border: "border-indigo-500",
  gradient: "from-indigo-600 to-blue-500",
};

/**
 * Pewarnaan per rubrik. Dicocokkan dengan `slug.includes(keyword)`, jadi
 * sub-kategori ikut warna induknya: "ekonomi-makro" kena "ekonomi" dan
 * "sepak-bola" kena "bola".
 */
const TOPIC_ACCENTS: { keywords: string[]; accent: CategoryAccent }[] = [
  {
    keywords: ["politik", "pemerintah", "hukum", "kriminal", "peristiwa"],
    accent: RED,
  },
  {
    keywords: ["ekonomi", "bisnis", "keuangan", "finansial", "pasar", "umkm"],
    accent: EMERALD,
  },
  {
    keywords: ["olahraga", "bola", "sport", "liga"],
    accent: BLUE,
  },
  {
    keywords: ["teknologi", "tekno", "gadget", "sains", "digital", "startup"],
    accent: INDIGO,
  },
  {
    keywords: ["hiburan", "selebriti", "musik", "film", "lifestyle", "gaya"],
    accent: PINK,
  },
  {
    keywords: ["otomotif", "mobil", "motor", "properti", "kuliner"],
    accent: AMBER,
  },
  {
    keywords: ["kesehatan", "sehat", "medis", "travel", "wisata"],
    accent: CYAN,
  },
  {
    keywords: ["internasional", "dunia", "global", "pendidikan", "edukasi"],
    accent: VIOLET,
  },
];

/** Urutan cadangan untuk kategori yang kata kuncinya belum terdaftar di atas. */
const FALLBACK_ACCENTS = [
  INDIGO,
  PINK,
  AMBER,
  CYAN,
  VIOLET,
  EMERALD,
  BLUE,
  RED,
];

/** Aksen default untuk hal-hal yang bukan kategori (mis. halaman tag). */
export const BRAND_ACCENT = RED;

export function categoryAccent(slug: string): CategoryAccent {
  const normalized = slug.toLowerCase();

  const topic = TOPIC_ACCENTS.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );
  if (topic) return topic.accent;

  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    // Modulo di setiap langkah supaya angkanya tidak pernah lewat batas aman.
    hash = (hash * 31 + normalized.charCodeAt(i)) % 1000003;
  }

  return FALLBACK_ACCENTS[hash % FALLBACK_ACCENTS.length];
}
