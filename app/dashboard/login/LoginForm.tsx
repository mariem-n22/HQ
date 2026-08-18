"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * Single-owner sign-in. Carried over from the Pit Wall login screen, minus the
 * "create the owner account" branch — there is no sign-up route on this stack,
 * and no email-confirmation step. The account comes from prisma/seed.ts.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    setBusy(false);
    if (!result || result.error) {
      setError("That email and password combination didn't work.");
      return;
    }
    router.push(from);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="panel w-full max-w-sm p-6">
      <p className="label-mono text-amber">Restricted — Pit Wall</p>
      <h1 className="display-title mt-3 text-3xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-mute">Owner access only.</p>

      {error ? (
        <p role="alert" className="mt-5 rounded-sm border border-signal/50 px-3 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <label className="mt-6 block">
        <span className="label-mono">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-sm border border-line bg-base px-3 py-2 text-sm text-ink focus:border-amber focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="label-mono">Password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-sm border border-line bg-base px-3 py-2 text-sm text-ink focus:border-amber focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-sm border border-amber bg-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-base disabled:opacity-60"
      >
        {busy ? "Working…" : "Sign in"}
      </button>
    </form>
  );
}
