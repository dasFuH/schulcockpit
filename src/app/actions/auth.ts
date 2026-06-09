"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, login } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";

export interface LoginState {
  fehler?: string;
}

export interface RegisterState {
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

/** Server Action: Schülerkonto registrieren und direkt anmelden. */
export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return { fehler: parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { fehler: "Für diese E-Mail gibt es bereits ein Konto." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role: "STUDENT",
    },
  });

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect("/");
}

/** Server Action: Logout. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
