"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestPasswordResetAction,
  type PasswordResetRequestState,
} from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Link wird angefordert…" : "Reset-Link anfordern"}
    </button>
  );
}

export function PasswordResetRequestForm() {
  const [state, formAction] = useActionState<PasswordResetRequestState, FormData>(
    requestPasswordResetAction,
    {},
  );

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
          autoComplete="email"
          inputMode="email"
          required
          maxLength={200}
          className="field"
          placeholder="name@beispiel.de"
        />
      </div>

      {state.erfolg && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.erfolg}
        </p>
      )}

      {state.fehler && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.fehler}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
