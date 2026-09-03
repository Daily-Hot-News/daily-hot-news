import { SignUpForm } from "@/features/auth/components/SignUpForm";

const SignUpPage = () => {
  return (
    <main>
      <h1 className="flex flex-col gap-4 w-full mt-30 text-center font-bold text-3xl">
        Sign Up Page
      </h1>
      <SignUpForm />
    </main>
  );
};

export default SignUpPage;
