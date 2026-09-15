import { prisma } from "@/lib/prisma";
import { PER_PAGE } from "@/lib/pagination";

export async function getSubscribers(page: number = 1, search: string = "") {
  const skip = (page - 1) * PER_PAGE;

  const whereClause = search
    ? {
        email: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [data, totalItems] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where: whereClause,
      skip,
      take: PER_PAGE,
      orderBy: { subscribedAt: "desc" },
    }),
    prisma.newsletterSubscriber.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / PER_PAGE);

  return {
    data,
    totalItems,
    totalPages,
    currentPage: page,
  };
}
