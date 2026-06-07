"use server";

import { redirect } from "next/navigation";
import { login, destroySession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export interface LoginState {
  fehler?: string;
}

/** Server Action: Login-Formular verarbeiten. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fehler: "Bitte E-Mail und Passwort prüfen." };
  }

  const session = await login(parsed.data.email, parsed.data.password);
  if (!session) {
    return { fehler: "E-Mail oder Passwort ist falsch." };
  }

  redirect("/");
}

/** Server Action: Logout. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
