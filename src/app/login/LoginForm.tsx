"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Anmelden…" : "Anmelden"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <label className="label" htmlFor="email">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          className="field"
          placeholder="name@beispiel.de"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          placeholder="••••••••"
        />
      </div>

      <div className="-mt-2 text-right text-sm">
        <Link href="/passwort-vergessen" className="font-medium text-brand">
          Passwort vergessen?
        </Link>
      </div>

      {state.fehler && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.fehler}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
