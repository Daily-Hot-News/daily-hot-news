import { prisma } from "@/lib/prisma";

export async function getAuthorByIdentifier(identifier: string) {
  if (!identifier) return null;
  // 1. Coba cari dulu berdasarkan SLUG di AuthorProfile
  let authorProfile = await prisma.authorProfile.findUnique({
    where: { slug: identifier },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          image: true,
          articles: {
            where: { status: "PUBLISHED" },
            select: { id: true, title: true, slug: true, createdAt: true },
          },
        },
      },
    },
  });
  // 2. Jika tidak ditemukan lewat slug, coba cari berdasarkan USER ID
  if (!authorProfile) {
    const user = await prisma.user.findFirst({
      where: {
        id: identifier,
        role: "AUTHOR",
      },
    });
    // Jika user tidak ada atau bukan AUTHOR, kembalikan null (akan 404)
    if (!user) return null;
    // 3. AUTO-CREATE: Buatkan AuthorProfile & Slug otomatis untuk Author ini!
    const autoSlug =
      user.name.toLowerCase().replace(/\s+/g, "-") + "-" + user.id.slice(-4);
    authorProfile = await prisma.authorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: user.name,
        slug: autoSlug,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            image: true,
            articles: {
              where: { status: "PUBLISHED" },
              select: { id: true, title: true, slug: true, createdAt: true },
            },
          },
        },
      },
    });
  }
  return authorProfile;
}
