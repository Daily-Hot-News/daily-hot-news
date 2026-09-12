"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/authorize";
import { resolveSlug, slugify } from "@/lib/slugify";
import { fail, ok, toUserMessage, type ActionResult } from "@/lib/actionResult";
import type { TagRef } from "./types";

function revalidateTagPages() {
  revalidatePath("/admin/tags");
  revalidatePath("/tag/[slug]", "page");
}

type TagInput = { name: string; slug: string };

function readForm(formData: FormData): TagInput | null {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return null;

  return {
    name,
    slug: resolveSlug(formData.get("slug") as string | null, name),
  };
}

export async function createTag(formData: FormData): Promise<ActionResult> {
  const authz = await requireAuthor();
  if (!authz.ok) return fail(authz.error);

  const input = readForm(formData);
  if (!input) return fail("Nama tag wajib diisi.");
  if (!input.slug) {
    return fail("Nama tag harus mengandung minimal satu huruf atau angka.");
  }

  try {
    const duplicate = await prisma.tag.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (duplicate) return fail(`Slug "${input.slug}" sudah dipakai tag lain.`);

    await prisma.tag.create({ data: input });

    revalidateTagPages();
    return ok();
  } catch (error: unknown) {
    console.error("createTag gagal:", error);
    return fail(toUserMessage(error, "Gagal membuat tag."));
  }
}

export async function updateTag(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const authz = await requireAuthor();
  if (!authz.ok) return fail(authz.error);

  const input = readForm(formData);
  if (!input) return fail("Nama tag wajib diisi.");
  if (!input.slug) {
    return fail("Nama tag harus mengandung minimal satu huruf atau angka.");
  }

  try {
    const duplicate = await prisma.tag.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (duplicate && duplicate.id !== id) {
      return fail(`Slug "${input.slug}" sudah dipakai tag lain.`);
    }

    await prisma.tag.update({ where: { id }, data: input });

    revalidateTagPages();
    return ok();
  } catch (error: unknown) {
    console.error("updateTag gagal:", error);
    return fail(toUserMessage(error, "Gagal memperbarui tag."));
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const authz = await requireAuthor();
  if (!authz.ok) return fail(authz.error);

  try {
    // ArticleTag pakai onDelete: Cascade, jadi menghapus tag hanya melepas
    // kaitannya dari artikel - artikelnya sendiri aman.
    await prisma.tag.delete({ where: { id } });

    revalidateTagPages();
    return ok();
  } catch (error: unknown) {
    console.error("deleteTag gagal:", error);
    return fail(toUserMessage(error, "Gagal menghapus tag."));
  }
}

/**
 * Kontrak untuk Dev B (fitur Article): terima daftar nama tag mentah dari form,
 * kembalikan tag yang sudah pasti ada di database - yang belum ada dibuatkan.
 *
 * Pencocokan berdasarkan slug, jadi "Pemilu 2029", "pemilu 2029", dan
 * "  Pemilu   2029  " semuanya mengarah ke satu tag yang sama.
 */
export async function findOrCreateTags(names: string[]): Promise<TagRef[]> {
  const authz = await requireAuthor();
  if (!authz.ok) return [];

  // Buang duplikat berdasarkan slug, pertahankan nama tampilan pertama.
  const bySlug = new Map<string, string>();
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, name);
  }
  if (bySlug.size === 0) return [];

  try {
    return await Promise.all(
      Array.from(bySlug, ([slug, name]) =>
        prisma.tag.upsert({
          where: { slug },
          update: {}, // tag sudah ada - jangan timpa nama tampilannya
          create: { name, slug },
          select: { id: true, name: true, slug: true },
        }),
      ),
    );
  } catch (error: unknown) {
    console.error("findOrCreateTags gagal:", error);
    return [];
  }
}
