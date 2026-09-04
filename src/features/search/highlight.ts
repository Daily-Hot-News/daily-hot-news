import { HL_END, HL_START } from "./types";

export type HighlightSegment = { text: string; match: boolean };

/**
 * Pecah cuplikan dari ts_headline jadi potongan biasa dan potongan yang cocok,
 * supaya komponen bisa membungkusnya dengan <mark> sebagai elemen React.
 *
 * Ini disengaja: alternatifnya adalah menyuntikkan <mark> lewat
 * dangerouslySetInnerHTML, yang berarti isi artikel (teks yang ditulis penulis)
 * akan dieksekusi sebagai HTML - celah XSS yang tidak perlu ada.
 */
export function splitHighlights(headline: string): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let rest = headline;

  while (rest.length > 0) {
    const start = rest.indexOf(HL_START);
    if (start === -1) break;

    const end = rest.indexOf(HL_END, start);
    if (end === -1) break; // penanda tidak lengkap - sisanya diperlakukan sebagai teks biasa

    if (start > 0) segments.push({ text: rest.slice(0, start), match: false });
    segments.push({
      text: rest.slice(start + HL_START.length, end),
      match: true,
    });
    rest = rest.slice(end + HL_END.length);
  }

  if (rest.length > 0) segments.push({ text: rest, match: false });
  return segments;
}
