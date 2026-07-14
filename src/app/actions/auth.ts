"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  hashPasswordResetToken,
  login,
} from "@/lib/auth";
import {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  passwordResetTokenSchema,
  registerSchema,
} from "@/lib/validation";
import { isMailConfigured, sendPasswordResetEmail } from "@/lib/mail";

export interface LoginState {
  fehler?: string;
}

export interface RegisterState {
  fehler?: string;
}

export interface PasswordResetRequestState {
  erfolg?: string;
  fehler?: string;
}

export interface PasswordResetState {
  erfolg?: string;
  fehler?: string;
  linkUngueltig?: boolean;
}

const PASSWORD_RESET_SUCCESS =
  "Falls für diese E-Mail ein Konto existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.";
const PASSWORD_RESET_UNAVAILABLE =
  "Der Passwort-Reset ist momentan nicht verfügbar. Bitte versuche es später erneut.";
const INVALID_PASSWORD_RESET_LINK =
  "Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.";
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

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

  await createSession({
    userId: user.id,
    sessionVersion: user.sessionVersion,
  });
  redirect("/");
}

/** Fordert einen einmaligen Passwort-Reset-Link an. */
export async function requestPasswordResetAction(
  _prev: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fehler: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  // Konfiguration vor der Kontosuche prüfen, damit der Dienstzustand keine
  // Kontoinformationen preisgibt.
  if (!isMailConfigured()) {
    return { fehler: PASSWORD_RESET_UNAVAILABLE };
  }

  try {
    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user) return { erfolg: PASSWORD_RESET_SUCCESS };

    const now = new Date();
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);
    const cooldownStartedBefore = new Date(
      now.getTime() - RESET_REQUEST_COOLDOWN_MS,
    );

    // Die Bedingung und das Setzen des Tokens passieren in einem Update. Das
    // verhindert parallele E-Mails innerhalb des Cooldowns pro Konto.
    const updated = await prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [
          { passwordResetRequestedAt: null },
          { passwordResetRequestedAt: { lte: cooldownStartedBefore } },
        ],
      },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
        passwordResetRequestedAt: now,
      },
    });
    if (updated.count !== 1) return { erfolg: PASSWORD_RESET_SUCCESS };

    try {
      await sendPasswordResetEmail({ to: user.email, token });
    } catch {
      // Nur den gerade angelegten Token zurücknehmen. Ein zwischenzeitlich
      // erstellter neuer Token darf dadurch nicht ungültig werden.
      try {
        await prisma.user.updateMany({
          where: { id: user.id, passwordResetTokenHash: tokenHash },
          data: {
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null,
          },
        });
      } catch {
        // Die Antwort bleibt absichtlich generisch. Keine Transportdetails
        // oder Token werden an den Client bzw. in Logs gegeben.
      }
    }

    return { erfolg: PASSWORD_RESET_SUCCESS };
  } catch {
    return { fehler: PASSWORD_RESET_UNAVAILABLE };
  }
}

/** Verbraucht einen gültigen Reset-Token und setzt ein neues Passwort. */
export async function resetPasswordAction(
  _prev: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const tokenResult = passwordResetTokenSchema.safeParse(formData.get("token"));
  if (!tokenResult.success) {
    return { fehler: INVALID_PASSWORD_RESET_LINK, linkUngueltig: true };
  }

  const parsed = passwordResetSchema.safeParse({
    token: tokenResult.data,
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return {
      fehler: parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen.",
    };
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);

  try {
    // Erst den noch gültigen Token prüfen; so wird bcrypt bei klar ungültigen
    // oder abgelaufenen Links nicht ausgeführt.
    const candidate = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (!candidate) {
      return { fehler: INVALID_PASSWORD_RESET_LINK, linkUngueltig: true };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const consumed = await prisma.user.updateMany({
      where: {
        id: candidate.id,
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        passwordResetRequestedAt: null,
        sessionVersion: { increment: 1 },
      },
    });
    if (consumed.count !== 1) {
      return { fehler: INVALID_PASSWORD_RESET_LINK, linkUngueltig: true };
    }

    return {
      erfolg:
        "Dein Passwort wurde zurückgesetzt. Du kannst dich jetzt anmelden.",
    };
  } catch {
    return {
      fehler: "Das Passwort konnte gerade nicht zurückgesetzt werden. Bitte versuche es erneut.",
    };
  }
}

/** Server Action: Logout. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
