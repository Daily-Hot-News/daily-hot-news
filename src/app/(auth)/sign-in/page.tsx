import { Suspense } from "react";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { ShowNotification } from "@/features/auth/components/ShowNotification";

const SignInPage = () => {
  return (
    <main className="flex-1 bg-linear-to-br from-red-50 via-white to-blue-50">
      {/* ShowNotification memakai useSearchParams(), yang membuat halaman ini
          gagal di-prerender kalau tidak dibatasi Suspense - `next build`
          berhenti dengan missing-suspense-with-csr-bailout. Notifikasinya
          sendiri tidak perlu fallback, jadi cukup null. */}
      <Suspense fallback={null}>
        <ShowNotification />
      </Suspense>

      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <span
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-rose-500 text-sm font-extrabold text-white shadow-sm"
            aria-hidden
          >
            DH
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-900">
            Sign In
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600">
            Masuk untuk mengelola artikel dan profil akunmu.
          </p>

          <SignInForm />
        </div>
      </div>
    </main>
  );
};

export default SignInPage;
