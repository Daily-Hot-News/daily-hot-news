import { SignUpForm } from "@/features/auth/components/SignUpForm";

const SignUpPage = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="mt-30">
        <h1 className="flex flex-col gap-4 w-full mt-30 text-center font-bold text-3xl">
          Sign Up
        </h1>
        <SignUpForm />
      </div>
    </main>
  );
};

export default SignUpPage;
