"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateAuthorProfile(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    if (session.user.role !== "AUTHOR") {
      return { error: "Anda tidak memiliki akses sebagai Author." };
    }

    const displayName = (formData.get("displayName") as string)?.trim();
    const jobTitle = (formData.get("jobTitle") as string)?.trim();
    const bio = (formData.get("bio") as string)?.trim();

    if (!displayName) {
      return { error: "Nama tidak boleh kosong." };
    }

    if (!jobTitle) {
      return { error: "Title tidak boleh kosong." };
    }

    // Generate slug dari displayName
    const slug =
      displayName.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      session.user.id.slice(-4);

    await prisma.authorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        displayName,
        jobTitle,
        bio,
      },
      create: {
        userId: session.user.id,
        displayName,
        slug,
        jobTitle,
        bio,
      },
    });

    revalidatePath(`/authors/${session.user.id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui profil author:", error);
    return {
      error:
        error.message || "Terjadi kesalahan saat memperbarui profil author.",
    };
  }
}
