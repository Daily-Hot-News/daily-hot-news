# Daily Hot News - Tim Developer Guide 🚀

Selamat datang di repositori **Daily Hot News**! Proyek ini dibangun menggunakan **Next.js 15 (App Router)**, **Tailwind CSS**, **Prisma 7**, dan **Better-Auth**.

---

## 🏗️ Arsitektur & Cara Kerja Tim (Vertical Slice)

Untuk mencegah bentrok (_conflict_) dan memperjelas tanggung jawab, tim kita menggunakan metode **Vertical Slice Architecture**. 

**Apa itu Vertical Slice?**
Setiap developer bertanggung jawab penuh atas satu fitur dari ujung ke ujung (_end-to-end_):
1. **Database / Schema:** Memperbarui model di Prisma (jika ada perubahan/tabel baru).
2. **Backend / SSR:** Membuat API Routes atau Server Actions, beserta logika pengambilan data.
3. **Frontend / UI:** Membangun antarmuka pengguna dengan murni Tailwind CSS.

### 📁 Standar Struktur Folder
Berdasarkan pendekatan _Vertical Slice_, kita akan mengelompokkan file berdasarkan **fitur**, bukan tipe file.

```text
src/
├── app/                  # (Routing Utama) Halaman Next.js (page.tsx, layout.tsx)
├── components/           # Komponen UI global (Button, Navbar, dll - MURNI TAILWIND)
├── features/             # (Fokus Vertical Slice) Semua fitur disimpan di sini
│   ├── article/          # Contoh Fitur: Artikel
│   │   ├── components/   # Komponen UI spesifik untuk artikel (misal: ArticleCard.tsx)
│   │   ├── actions.ts    # Next.js Server Actions untuk artikel
│   │   ├── queries.ts    # Fungsi pengambilan data database (Prisma)
│   │   └── types.ts      # TypeScript interfaces/types untuk artikel
│   └── comment/          # Contoh Fitur: Komentar
├── lib/                  # Utilitas global (konfigurasi Prisma, Better-Auth, dsb)
└── ...
```

*Aturan Emas:* Jika sebuah komponen hanya dipakai di satu fitur (misalnya `ArticleCard`), taruh di dalam folder fiturnya `src/features/article/components/`. Jika dipakai di banyak tempat (seperti `Button`), taruh di `src/components/`.

---

## 🗄️ Database Workflow (Cloud DB Branching)

Kita menggunakan PostgreSQL, tetapi **tidak perlu setup database lokal (Docker, dll)**. Kita memanfaatkan fitur **Database Branching** dari layanan Cloud Database (misal: Neon / Supabase).

1. Setiap developer akan membuat "Branch" dari database utama di dashboard Cloud.
2. Dapatkan _Connection String_ dari branch tersebut.
3. Masukkan ke file `.env` lokal Anda sebagai `DATABASE_URL`.

Dengan cara ini, jika Anda menghapus tabel atau melakukan migrasi, hal itu tidak akan merusak database rekan tim Anda.

---

## 💻 Cara Memulai (Local Setup)

Langkah-langkah untuk melakukan _clone_ dan menjalankan proyek di mesin lokal Anda:

### 1. Clone Repositori
```bash
git clone <repository-url>
cd daily-hot-news
```

### 2. Install Dependensi
Pastikan Anda sudah menginstal Node.js versi terbaru, lalu jalankan:
```bash
npm install
```

### 3. Setup Environment Variables
Salin file template environment:
```bash
cp .env.example .env
```
Buka file `.env` dan isi variabel berikut:
- `DATABASE_URL`: Masukkan URL dari database branch Anda (seperti yang dijelaskan di atas).
- `BETTER_AUTH_SECRET`: Bebas diisi dengan string acak (untuk enkripsi sesi).
- `BETTER_AUTH_URL`: `http://localhost:3000`

### 4. Push Skema ke Database Anda
Sinkronkan skema Prisma ke database branch Anda:
```bash
npx prisma db push
```
*(Catatan: Jangan gunakan `prisma migrate dev` kecuali disuruh oleh Lead Developer, cukup gunakan `db push` untuk prototyping cepat di branch Anda).*

Lalu, _generate_ Prisma Client agar tipe datanya tersinkronisasi:
```bash
npx prisma generate
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda. Selamat _coding_!

---

## 🎨 Standar Styling (Tailwind CSS)

Tim kita menggunakan **Murni Tailwind CSS** untuk seluruh styling tanpa bantuan UI Library/Koleksi tambahan (seperti shadcn/ui).
- Gunakan _utility classes_ langsung di elemen HTML/JSX.
- Buat komponen modular (misal: `<Button />`) jika styling dirasa mulai berulang dan kodenya berantakan.

Semangat bekerja sama! Jika ada pertanyaan, jangan ragu untuk bertanya di grup tim. 🚀
