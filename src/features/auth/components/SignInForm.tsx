"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { authClient } from "@/lib/authClient";
import Link from "next/link";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: false,
      callbackURL: "/",
    });

    setIsLoading(false);

    if (error) {
      console.error(error.message);
      alert(`${error.message}`);
      return;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-5"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {" "}
        {isLoading ? "Processing..." : "Login"}{" "}
      </Button>

      <div className="flex gap-1">
        <span className="text-sm text-zinc-600">Need an account? </span>{" "}
        <Link
          href="/sign-up"
          className="text-sm font-semibold text-red-600 transition-colors duration-200 hover:text-red-700"
        >
          Register here
        </Link>
      </div>
    </form>
  );
}
