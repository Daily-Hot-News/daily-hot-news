import { Prisma } from "@prisma/client";

export type CategoryWithParent = Prisma.CategoryGetPayload<{
  include: {
    parent: true;
  };
}>;

export type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: {
    parent: true;
    _count: { select: { articles: true; children: true } };
  };
}>;

export type CategoryTreeNode = Prisma.CategoryGetPayload<{
  include: {
    children: true;
    _count: { select: { articles: true } };
  };
}>;
