/**
 * Base URL situs, dipakai sitemap.xml, robots.txt, dan metadataBase.
 * Trailing slash dibuang supaya penggabungan URL tidak menghasilkan "//".
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "Daily Hot News";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
