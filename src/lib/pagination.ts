export const PER_PAGE = 10;

/** Ambil nomor halaman dari query string. Nilai aneh (0, -3, "abc", array) jatuh ke 1. */
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** Ambil satu nilai string dari query string yang bisa saja berulang (?q=a&q=b). */
export function parseStringParam(
  value: string | string[] | undefined,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}
