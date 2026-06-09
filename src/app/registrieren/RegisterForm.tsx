"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Konto wird erstellt..." : "Konto erstellen"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerAction,
    {},
  );

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          className="field"
          placeholder="z. B. Mia"
        />
      </div>

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
          maxLength={200}
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
          autoComplete="new-password"
          required
          minLength={8}
          className="field"
          placeholder="Mindestens 8 Zeichen"
        />
      </div>

      <div>
        <label className="label" htmlFor="passwordConfirm">
          Passwort wiederholen
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field"
          placeholder="Noch einmal eingeben"
        />
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
