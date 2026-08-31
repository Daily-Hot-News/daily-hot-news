import { Prisma } from "@prisma/client";

export type CategoryWithParent = Prisma.CategoryGetPayload<{
  include: {
    parent: true;
  };
}>;
