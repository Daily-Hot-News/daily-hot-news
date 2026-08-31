"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;

    if (!name || !slug) {
      return { error: "Name and Slug are required" };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return { error: "Category with this slug already exists" };
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { error: "Failed to create category. " + error.message };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;

    if (!name || !slug) {
      return { error: "Name and Slug are required" };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== id) {
      return { error: "Category with this slug already exists" };
    }

    if (parentId === id) {
      return { error: "Category cannot be its own parent" };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category. " + error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category. " + error.message };
  }
}
