"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUpStore } from "@/lib/store";

export default function SingUpForm() {
  const [password, setPassword] = useState("");

  const email = useSignUpStore((state) => state.email);
  const status = useSignUpStore((state) => state.status);
  const error = useSignUpStore((state) => state.error);
  const setEmail = useSignUpStore((state) => state.setEmail);
  const signUp = useSignUpStore((state) => state.signUp);
  const resetForm = useSignUpStore((state) => state.resetForm);
  

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signUp(password);
  };
  // navigate to verify page
  useEffect(() => {
    if (status === "success") {
      router.push(`verify-email?email=${email}`);
      resetForm();
    }
  }, [status, email, router,resetForm]);
  return (
    <form className="bg-gray-700 p-4" onSubmit={handleSubmit}>
      <input
        className="p-1 border-2"
        onChange={(event) => {
          setEmail(event.target.value.trim());
        }}
        type="email"
        placeholder="Email"
        value={email}
        required
        id="email"
        name="email"
        autoComplete="email"
      />
      {error && error?.email && <p>{error.email}</p>}

      <input
        className="p-1 border-2"
        onChange={(event) => {
          setPassword(event.target.value.trim());
        }}
        type="password"
        placeholder="password"
        value={password}
        required
      />
      {error && error?.password && <p>{error.password}</p>}
      {error && error?.general && <p>{error.general}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className={
          status === "submitting" ? "opacity-50 cursor-not-allowed" : ""
        }
      >
        {status === "submitting" ? "Signing up..." : "Submit"}
      </button>
    </form>
  );
}
