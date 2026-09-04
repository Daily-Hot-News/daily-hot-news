"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/authorize";
import { resolveSlug } from "@/lib/slugify";
import { fail, ok, toUserMessage, type ActionResult } from "@/lib/actionResult";

/** Halaman yang perlu di-refresh setiap kali data kategori berubah. */
function revalidateCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePath("/kategori/[slug]", "page");
  revalidatePath("/");
}

/**
 * Cek apakah menjadikan `parentId` sebagai induk dari `categoryId` akan
 * membentuk lingkaran (A -> B -> A). Ditelusuri ke atas sampai akar.
 */
async function wouldCreateCycle(
  categoryId: string,
  parentId: string,
): Promise<boolean> {
  const visited = new Set<string>();
  let cursor: string | null = parentId;

  while (cursor) {
    if (cursor === categoryId) return true;
    if (visited.has(cursor)) break; // data sudah korup duluan, jangan looping selamanya
    visited.add(cursor);

    const parent: { parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
    cursor = parent?.parentId ?? null;
  }

  return false;
}

type CategoryInput = {
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
};

function readForm(formData: FormData): CategoryInput | null {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return null;

  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const parentId = (formData.get("parentId") as string | null) || null;

  return {
    name,
    slug: resolveSlug(formData.get("slug") as string | null, name),
    description,
    parentId,
  };
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const authz = await requireAuthor();
  if (!authz.ok) return fail(authz.error);

  const input = readForm(formData);
  if (!input) return fail("Nama kategori wajib diisi.");
  if (!input.slug) {
    return fail("Nama kategori harus mengandung minimal satu huruf atau angka.");
  }

  try {
    const duplicate = await prisma.category.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (duplicate) {
      return fail(`Slug "${input.slug}" sudah dipakai kategori lain.`);
    }

    await prisma.category.create({ data: input });

    revalidateCategoryPages();
    return ok();
  } catch (error: unknown) {
    console.error("createCategory gagal:", error);
    return fail(toUserMessage(error, "Gagal membuat kategori."));
  }
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const authz = await requireAuthor();
  if (!authz.ok) return fail(authz.error);

  const input = readForm(formData);
  if (!input) return fail("Nama kategori wajib diisi.");
  if (!input.slug) {
    return fail("Nama kategori harus mengandung minimal satu huruf atau angka.");
  }

  try {
    const duplicate = await prisma.category.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (duplicate && duplicate.id !== id) {
      return fail(`Slug "${input.slug}" sudah dipakai kategori lain.`);
    }

    if (input.parentId) {
      if (input.parentId === id) {
        return fail("Kategori tidak bisa menjadi induk dirinya sendiri.");
      }
      if (await wouldCreateCycle(id, input.parentId)) {
        return fail(
          "Induk tersebut membuat hirarki melingkar (kategori ini adalah leluhurnya).",
        );
      }
    }

    await prisma.category.update({ where: { id }, data: input });

    revalidateCategoryPages();
    return ok();
  } catch (error: unknown) {
    console.error("updateCategory gagal:", error);
    return fail(toUserMessage(error, "Gagal memperbarui kategori."));
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const authz = await requireAuthor();
  if (!authz.ok) return fail(authz.error);

  try {
    // Article.categoryId dan Category.parentId pakai onDelete: Restrict,
    // jadi cek dulu supaya user dapat pesan yang jelas, bukan error Prisma mentah.
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        name: true,
        _count: { select: { children: true, articles: true } },
      },
    });

    if (!category) return fail("Kategori tidak ditemukan.");

    if (category._count.articles > 0) {
      return fail(
        `Tidak bisa dihapus: masih ada ${category._count.articles} artikel di kategori "${category.name}". Pindahkan artikelnya dulu.`,
      );
    }
    if (category._count.children > 0) {
      return fail(
        `Tidak bisa dihapus: "${category.name}" masih punya ${category._count.children} sub-kategori. Hapus atau pindahkan sub-kategorinya dulu.`,
      );
    }

    await prisma.category.delete({ where: { id } });

    revalidateCategoryPages();
    return ok();
  } catch (error: unknown) {
    console.error("deleteCategory gagal:", error);
    return fail(toUserMessage(error, "Gagal menghapus kategori."));
  }
}
