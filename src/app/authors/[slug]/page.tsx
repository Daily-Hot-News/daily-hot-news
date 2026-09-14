import { getAuthorByIdentifier } from "@/features/authors/queries";
import { AuthorProfileView } from "@/features/authors/components/AuthorProfileView";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params
  const { slug } = await params;

  // Ambil profil author (otomatis buatkan slug jika belum punya)
  const authorProfile = await getAuthorByIdentifier(slug);

  if (!authorProfile) {
    notFound();
  }

  // Redirect otomatis ke URL Slug
  if (slug !== authorProfile.slug) {
    redirect(`/authors/${authorProfile.slug}`);
  }

  // Ambil sesi pengguna saat ini untuk edit profile
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isOwner = session?.user?.id === authorProfile.userId;

  return (
    <main className="min-h-screen bg-zinc-50/50 py-12 px-4 sm:px-6">
      <AuthorProfileView authorProfile={authorProfile} isOwner={isOwner} />
    </main>
  );
}
