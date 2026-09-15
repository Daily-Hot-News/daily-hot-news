import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserProfile() {
  // Ambil sesi user saat ini di Server Component
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  // Ambil data user lengkap dari tabel User di database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      // Jika user adalah author, kita bisa sekalian hitung artikelnya
      _count: {
        select: {
          articles: true,
          comments: true,
        },
      },
    },
  });

  return user;
}
