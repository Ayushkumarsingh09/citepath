"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Login failed");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="surface w-full max-w-md p-8">
        <div className="font-display text-2xl">CitePath</div>
        <h1 className="mt-2 text-lg text-muted">Welcome back</h1>
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-muted">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-[10px] border border-border bg-muted px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Password</span>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-[10px] border border-border bg-muted px-3 py-2"
            />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <Button className="mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Start free trial
          </Link>
        </p>
      </form>
    </div>
  );
}
