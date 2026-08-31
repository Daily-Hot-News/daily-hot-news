import { prisma } from "@/lib/prisma";
import { CategoryWithParent } from "./types";

export async function getCategories(): Promise<CategoryWithParent[]> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    });
    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}
