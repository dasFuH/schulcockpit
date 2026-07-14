"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  resetPasswordAction,
  type PasswordResetState,
} from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Passwort wird gespeichert…" : "Passwort speichern"}
    </button>
  );
}

export function PasswordResetForm({
  token,
  invalidLink,
}: {
  token: string;
  invalidLink: boolean;
}) {
  const [state, formAction] = useActionState<PasswordResetState, FormData>(
    resetPasswordAction,
    {},
  );

  if (invalidLink || state.linkUngueltig) {
    return (
      <div className="card space-y-4">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.fehler ??
            "Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an."}
        </p>
        <Link href="/passwort-vergessen" className="btn-primary block w-full text-center">
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  if (state.erfolg) {
    return (
      <div className="card space-y-4">
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.erfolg}
        </p>
        <Link href="/login" className="btn-primary block w-full text-center">
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="label" htmlFor="password">
          Neues Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={200}
          className="field"
          placeholder="Mindestens 8 Zeichen"
        />
      </div>

      <div>
        <label className="label" htmlFor="passwordConfirm">
          Neues Passwort wiederholen
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={200}
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
