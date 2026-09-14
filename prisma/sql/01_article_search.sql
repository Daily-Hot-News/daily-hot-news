-- =============================================================================
-- Full-text search untuk Article  (Dev C - fitur Search)
-- =============================================================================
--
-- CARA PAKAI
--   Jalankan di Supabase Dashboard -> SQL Editor, SETIAP KALI setelah
--   `npx prisma db push`. Script ini idempotent, aman dijalankan berulang.
--
-- KENAPA HARUS DIULANG?
--   Prisma tidak mengenal tipe `tsvector`. Kolom `search_vector` dideklarasikan
--   di schema.prisma sebagai Unsupported() supaya `db push` tidak MENGHAPUSNYA,
--   tapi kalau kolomnya belum ada, `db push` akan membuatnya sebagai kolom
--   tsvector BIASA - bukan generated column. Kolom biasa itu isinya NULL
--   selamanya, dan pencarian akan mengembalikan nol hasil tanpa pesan error.
--   Karena itu di bawah ini kolomnya di-DROP dulu baru dibuat ulang.
--   Aman: isinya 100% turunan dari title/excerpt/content, tidak ada data hilang.
--
-- KENAPA 'simple', BUKAN 'english'?
--   PostgreSQL tidak punya dictionary Bahasa Indonesia. Konfigurasi 'english'
--   akan melakukan stemming ala Inggris yang salah untuk teks Indonesia
--   (mis. "beritanya" tidak akan ketemu dari "berita"). 'simple' hanya
--   memecah kata dan lowercase - tanpa stemming, tanpa stopword - dan itu
--   perilaku paling benar yang tersedia untuk teks Indonesia.
--
-- BOBOT
--   A = judul   (paling relevan)
--   B = excerpt
--   C = isi     (paling lemah)
--   Bobot ini yang dipakai ts_rank() untuk mengurutkan hasil.
-- =============================================================================

ALTER TABLE "Article" DROP COLUMN IF EXISTS search_vector;

ALTER TABLE "Article"
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,   '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS article_search_vector_idx
  ON "Article" USING GIN (search_vector);

-- Verifikasi cepat - index harus terpakai (Bitmap Index Scan, bukan Seq Scan):
--
--   EXPLAIN ANALYZE
--   SELECT id, ts_rank(search_vector, websearch_to_tsquery('simple', 'ekonomi')) AS rank
--   FROM "Article"
--   WHERE search_vector @@ websearch_to_tsquery('simple', 'ekonomi')
--   ORDER BY rank DESC;
