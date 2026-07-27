"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function SignupPage() {
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
        action: "register",
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        workspaceName: fd.get("workspaceName"),
        mode: fd.get("mode"),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Signup failed");
      return;
    }
    router.push("/onboarding");
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="surface w-full max-w-md p-8">
        <div className="font-display text-2xl">CitePath</div>
        <h1 className="mt-2 text-lg text-muted">Create your account — 14-day trial</h1>
        <div className="mt-6 space-y-4">
          <Field name="name" label="Name" required />
          <Field name="email" label="Work email" type="email" required />
          <Field name="password" label="Password" type="password" required />
          <Field name="workspaceName" label="Workspace name" required />
          <label className="block text-sm">
            <span className="text-muted">Workspace mode (cannot change later)</span>
            <select
              name="mode"
              className="mt-1 w-full rounded-[10px] border border-border bg-muted px-3 py-2"
              defaultValue="SOLO"
            >
              <option value="SOLO">Solo</option>
              <option value="TEAM">Team</option>
            </select>
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <Button className="mt-6 w-full" disabled={loading}>
          {loading ? "Creating…" : "Start trial"}
        </Button>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-[10px] border border-border bg-muted px-3 py-2 outline-none focus:border-accent"
      />
    </label>
  );
}
