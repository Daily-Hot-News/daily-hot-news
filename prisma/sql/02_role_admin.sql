-- Rename role AUTHOR -> ADMIN.
--
-- Proyek ini hanya punya dua role: USER dan ADMIN. Enum di database dibuat
-- dengan nilai 'AUTHOR', jadi nilainya perlu di-rename sekali.
--
-- Dipakai RENAME VALUE, bukan drop-and-recreate, supaya baris `user` yang
-- sudah ada ikut terbaca sebagai ADMIN tanpa migrasi data terpisah.
--
-- PENTING: database Supabase ini dipakai bersama tim. Jalankan skrip ini hanya
-- setelah dev lain siap, karena kode yang masih membandingkan role dengan
-- 'AUTHOR' akan langsung berhenti cocok.
--
-- Idempoten: aman dijalankan ulang, tidak error kalau sudah pernah jalan.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'UserRole' AND e.enumlabel = 'AUTHOR'
  ) THEN
    ALTER TYPE "UserRole" RENAME VALUE 'AUTHOR' TO 'ADMIN';
  END IF;
END
$$;
