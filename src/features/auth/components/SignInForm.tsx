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
          className="md:max-w-md border rounded border-zinc-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="border rounded border-zinc-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {" "}
        {isLoading ? "Processing..." : "Login"}{" "}
      </Button>

      <div className="flex gap-1">
        <label className="text-sm font-medium">Need an account? </label>{" "}
        <Link
          href="/sign-up"
          className="text-sm font-medium hover:text-blue-500 transition duration-300 cursor-pointer"
        >
          Register here
        </Link>
      </div>
    </form>
  );
}
