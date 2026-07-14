/**
 * Schlanke Auth-Schicht ohne externe Auth-Bibliothek.
 *
 * - Passwörter werden mit bcrypt gehasht.
 * - Die Session ist ein signiertes JWT (jose) in einem httpOnly-Cookie.
 * - Zwei Rollen: STUDENT (Vollzugriff) und PARENT (nur Lesezugriff).
 */
import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "cockpit_session";
const SESSION_DAYS = 30;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET fehlt oder ist zu kurz. Bitte in .env setzen (mind. 16 Zeichen).",
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  role: Role;
  name: string;
  sessionVersion: number;
}

interface SessionTokenPayload {
  userId: string;
  sessionVersion: number;
}

/** Passwort prüfen. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Passwort hashen (für Registrierung/Seed). */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Hash eines Passwort-Reset-Tokens. Nur der Hash wird persistiert. */
export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Erstellt ein signiertes Session-JWT und setzt es als Cookie. */
export async function createSession(payload: SessionTokenPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

/** Liest und verifiziert die aktuelle Session (oder null). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId;
    const tokenSessionVersion =
      payload.sessionVersion === undefined ? 0 : payload.sessionVersion;

    if (
      typeof userId !== "string" ||
      typeof tokenSessionVersion !== "number" ||
      !Number.isSafeInteger(tokenSessionVersion) ||
      tokenSessionVersion < 0
    ) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, sessionVersion: true },
    });
    if (!user || user.sessionVersion !== tokenSessionVersion) return null;

    return {
      userId: user.id,
      role: user.role,
      name: user.name,
      sessionVersion: user.sessionVersion,
    };
  } catch {
    return null;
  }
}

/** Session löschen (Logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Login per E-Mail + Passwort. Gibt die Session zurück oder null bei
 * falschen Zugangsdaten.
 */
export async function login(
  email: string,
  password: string,
): Promise<SessionPayload | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    name: user.name,
    sessionVersion: user.sessionVersion,
  };
  await createSession({
    userId: payload.userId,
    sessionVersion: payload.sessionVersion,
  });
  return payload;
}

/**
 * Hilfsfunktion für Server Components / Actions: erzwingt eine Session.
 * Wirft, wenn niemand eingeloggt ist (wird im Layout vom Redirect abgefangen).
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

/** True, wenn die Rolle Schreibrechte hat (nur STUDENT). */
export function canWrite(role: Role): boolean {
  return role === "STUDENT";
}
