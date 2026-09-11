import { SignInForm } from "@/features/auth/components/SignInForm";
import { ShowNotification } from "@/features/auth/components/ShowNotification";

const SignInPage = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="mt-30">
        <ShowNotification />
        <h1 className="flex flex-col gap-4 w-full text-center font-bold text-3xl">
          Sign In
        </h1>
        <SignInForm />
      </div>
    </main>
  );
};

export default SignInPage;
