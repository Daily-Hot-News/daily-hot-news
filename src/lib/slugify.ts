/** Tanda diakritik Unicode (combining marks) yang tersisa setelah normalisasi NFD. */
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * Ubah teks bebas jadi slug URL-safe.
 *
 * "Politik & Hukum"     -> "politik-hukum"
 * "  Ekonomi   Makro  " -> "ekonomi-makro"
 * "Café Éropa"          -> "cafe-eropa"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD") // pisahkan huruf dari diakritiknya
    .replace(COMBINING_MARKS, "") // buang diakritik (é -> e)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // apa pun selain alfanumerik jadi pemisah
    .replace(/^-+|-+$/g, ""); // rapikan dash di awal/akhir
}

/**
 * Pakai slug yang diketik user kalau ada isinya, kalau tidak turunkan dari `fallback`.
 * Slug ketikan user tetap dinormalisasi supaya tidak ada spasi/huruf kapital yang lolos.
 */
export function resolveSlug(
  input: string | null | undefined,
  fallback: string,
): string {
  return slugify(input ?? "") || slugify(fallback);
}
