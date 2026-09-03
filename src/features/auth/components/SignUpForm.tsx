"use client";

import { useState } from "react";
import { authClient } from "@/lib/authClient";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await authClient.signUp.email({
      name: name,
      email: email,
      password: password,
    });

    setIsLoading(false);

    if (error) {
      console.error(error.message);
      alert(`${error.message}`);
      return;
    }

    if (data) {
      router.push("/sign-in?registered=true");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-5"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded border-zinc-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded border-zinc-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password (8 or more characters)
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

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border rounded border-zinc-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "Register"}
      </Button>

      <div className="flex justify-end gap-1">
        <label className="text-sm font-medium">Already have an account? </label>
        <Link
          href="/sign-in"
          className="text-sm font-medium hover:text-blue-500 transition duration-300 cursor-pointer"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
