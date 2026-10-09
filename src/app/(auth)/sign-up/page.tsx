import { SignUpForm } from "@/features/auth/components/SignUpForm";

const SignUpPage = () => {
  return (
    <main className="flex-1 bg-linear-to-br from-red-50 via-white to-blue-50">
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
          <span
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-rose-500 text-sm font-extrabold text-white shadow-sm"
            aria-hidden
          >
            DH
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-900">
            Sign Up
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600">
            Buat akun untuk mulai mengikuti kabar terbaru.
          </p>

          <SignUpForm />
        </div>
      </div>
    </main>
  );
};

export default SignUpPage;
