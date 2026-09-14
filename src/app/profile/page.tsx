import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/features/profile/queries";
import { ProfileCard } from "@/features/profile/components/ProfileCards";

export const metadata: Metadata = {
  title: "Account Profile - Daily Hot News",
  description: "Informasi profil dan akun pengguna.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getUserProfile();

  // Jika pengunjung belum login, redirect ke halaman login
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-zinc-50/50 py-12 px-4 sm:px-6">
      <ProfileCard user={user} />
    </main>
  );
}
