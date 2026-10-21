"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState | undefined, FormData>(login, undefined);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form action={formAction} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <Logo />
        <h1 className="font-display mt-8 text-3xl text-coal">Admin login</h1>
        <label htmlFor="password" className="mt-6 block font-semibold text-coal">
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="mt-1.5 w-full rounded-xl border-2 border-coal/15 px-4 py-3 outline-none focus:border-bronze"
        />
        {state?.error && <p className="mt-3 font-semibold text-ketchup">{state.error}</p>}
        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending}>
          {pending ? "Bezig…" : "Inloggen"}
        </button>
      </form>
    </main>
  );
}
