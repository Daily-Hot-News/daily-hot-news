import type { ArticleCardData } from "@/lib/articleCard";

/** Penanda highlight dari ts_headline. Sengaja bukan HTML supaya tidak pernah
 *  perlu dangerouslySetInnerHTML - lihat splitHighlights() di ./highlight.ts */
export const HL_START = "[[HL]]";
export const HL_END = "[[/HL]]";

export type SearchHit = ArticleCardData & {
  /** Cuplikan isi artikel di sekitar kata yang dicari, masih mengandung penanda highlight. */
  headline: string;
};

export type SearchResponse = {
  hits: SearchHit[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export const EMPTY_SEARCH: SearchResponse = {
  hits: [],
  total: 0,
  page: 1,
  perPage: 10,
  totalPages: 0,
};
