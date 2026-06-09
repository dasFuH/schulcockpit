"use client";

import { useRef, useState } from "react";
import {
  createParentUser,
  updateOwnAccount,
  updateParentUser,
} from "@/app/actions/users";
import { useSheetClose } from "@/components/Sheet";
import { SubmitButton } from "./fields";

export interface UserFormInitial {
  id: string;
  name: string;
  email: string;
}

function actionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("EMAIL_EXISTS")) {
    return "Für diese E-Mail gibt es bereits ein Konto.";
  }
  if (message.includes("CURRENT_PASSWORD_REQUIRED")) {
    return "Zum Ändern des Passworts ist das aktuelle Passwort nötig.";
  }
  return "Die Änderung konnte nicht gespeichert werden.";
}

export function OwnAccountForm({ initial }: { initial: UserFormInitial }) {
  const [error, setError] = useState<string | null>(null);
  const closeSheet = useSheetClose();

  async function handle(formData: FormData) {
    setError(null);
    try {
      await updateOwnAccount(formData);
      closeSheet();
    } catch (err) {
      setError(actionErrorMessage(err));
    }
  }

  return (
    <form action={handle} className="space-y-4">
      <div>
        <label className="label" htmlFor="own-name">
          Name
        </label>
        <input
          id="own-name"
          name="name"
          required
          maxLength={100}
          defaultValue={initial.name}
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="own-email">
          E-Mail
        </label>
        <input
          id="own-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          maxLength={200}
          defaultValue={initial.email}
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="own-password">
          Neues Passwort (optional)
        </label>
        <input
          id="own-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="field"
          placeholder="Leer lassen, wenn es gleich bleibt"
        />
      </div>

      <div>
        <label className="label" htmlFor="currentPassword">
          Aktuelles Passwort
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="field"
          placeholder="Nur bei Passwortänderung nötig"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

export function ParentUserForm({ initial }: { initial?: UserFormInitial }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const closeSheet = useSheetClose();

  async function handle(formData: FormData) {
    setError(null);
    try {
      if (initial) {
        await updateParentUser(initial.id, formData);
      } else {
        await createParentUser(formData);
      }
      formRef.current?.reset();
      closeSheet();
    } catch (err) {
      setError(actionErrorMessage(err));
    }
  }

  return (
    <form ref={formRef} action={handle} className="space-y-4">
      <div>
        <label className="label" htmlFor={initial ? `parent-name-${initial.id}` : "parent-name"}>
          Name
        </label>
        <input
          id={initial ? `parent-name-${initial.id}` : "parent-name"}
          name="name"
          required
          maxLength={100}
          defaultValue={initial?.name}
          className="field"
          placeholder="z. B. Mama"
        />
      </div>

      <div>
        <label className="label" htmlFor={initial ? `parent-email-${initial.id}` : "parent-email"}>
          E-Mail
        </label>
        <input
          id={initial ? `parent-email-${initial.id}` : "parent-email"}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          maxLength={200}
          defaultValue={initial?.email}
          className="field"
          placeholder="eltern@beispiel.de"
        />
      </div>

      <div>
        <label className="label" htmlFor={initial ? `parent-password-${initial.id}` : "parent-password"}>
          {initial ? "Neues Passwort (optional)" : "Passwort"}
        </label>
        <input
          id={initial ? `parent-password-${initial.id}` : "parent-password"}
          name="password"
          type="password"
          autoComplete="new-password"
          required={!initial}
          minLength={8}
          className="field"
          placeholder={
            initial
              ? "Leer lassen, wenn es gleich bleibt"
              : "Mindestens 8 Zeichen"
          }
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <SubmitButton label={initial ? "Speichern" : "Elternkonto anlegen"} />
    </form>
  );
}
