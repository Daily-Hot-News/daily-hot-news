import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCategoryTree } from "@/features/category/queries";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Serif untuk judul - memberi kesan editorial seperti halaman koran. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Kabar Hangat Setiap Hari`,
    template: `%s - ${SITE_NAME}`,
  },
  description:
    "Portal berita harian: politik, ekonomi, teknologi, olahraga, dan topik hangat lainnya.",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Tanggal di pita atas dan daftar kategori harus dihitung per request. Tanpa
  // connection(), keduanya ikut ter-prerender saat build - navbar akan terus
  // menampilkan tanggal hari build dan kategori baru tidak pernah muncul.
  await connection();

  // Kategori ditarik di sini supaya navbar dan footer punya menu yang sama di
  // seluruh halaman. getCategoryTree() sudah menangani errornya sendiri dan
  // mengembalikan [] kalau database tidak bisa dihubungi.
  const categoryTree = await getCategoryTree();
  const navCategories = categoryTree.map(({ name, slug }) => ({ name, slug }));

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-zinc-900">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-red-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Langsung ke konten
        </a>

        <Navbar
          categories={navCategories}
          todayLabel={dateFormatter.format(new Date())}
        />

        {/* flex-col supaya <main> halaman bisa ikut memanjang (mis. latar
            gradien halaman login) sampai mentok ke footer. */}
        <div id="konten" className="flex flex-1 flex-col">
          {children}
        </div>

        <Footer categories={navCategories} />
      </body>
    </html>
  );
}
