import { Prisma } from "@prisma/client";

export type TagWithCount = Prisma.TagGetPayload<{
  include: {
    _count: { select: { articles: true } };
  };
}>;

/** Bentuk ringkas yang dikembalikan `findOrCreateTags` untuk dipakai Dev B. */
export type TagRef = {
  id: string;
  name: string;
  slug: string;
};
