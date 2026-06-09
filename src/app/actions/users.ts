"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  canWrite,
  createSession,
  hashPassword,
  requireSession,
  verifyPassword,
} from "@/lib/auth";
import {
  accountUpdateSchema,
  parentUserCreateSchema,
  parentUserUpdateSchema,
} from "@/lib/validation";

async function requireStudent() {
  const session = await requireSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

async function emailBelongsToOtherUser(email: string, userId: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  return Boolean(existing && existing.id !== userId);
}

export async function updateOwnAccount(formData: FormData) {
  const session = await requireStudent();
  const data = accountUpdateSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
  });
  const email = normalizeEmail(data.email);

  if (await emailBelongsToOtherUser(email, session.userId)) {
    throw new Error("EMAIL_EXISTS");
  }

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
  });

  if (data.password) {
    const ok = await verifyPassword(
      data.currentPassword ?? "",
      currentUser.passwordHash,
    );
    if (!ok) throw new Error("CURRENT_PASSWORD_REQUIRED");
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: data.name,
      email,
      ...(data.password
        ? { passwordHash: await hashPassword(data.password) }
        : {}),
    },
  });

  await createSession({
    userId: updated.id,
    role: updated.role,
    name: updated.name,
  });
  revalidatePath("/nutzer");
  revalidatePath("/");
}

export async function createParentUser(formData: FormData) {
  const session = await requireStudent();
  const data = parentUserCreateSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = normalizeEmail(data.email);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("EMAIL_EXISTS");

  await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash: await hashPassword(data.password),
      role: "PARENT",
      managedStudentId: session.userId,
    },
  });
  revalidatePath("/nutzer");
}

export async function updateParentUser(id: string, formData: FormData) {
  const session = await requireStudent();
  const data = parentUserUpdateSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = normalizeEmail(data.email);

  const parent = await prisma.user.findFirst({
    where: { id, role: "PARENT", managedStudentId: session.userId },
  });
  if (!parent) throw new Error("FORBIDDEN");
  if (await emailBelongsToOtherUser(email, id)) throw new Error("EMAIL_EXISTS");

  await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email,
      ...(data.password
        ? { passwordHash: await hashPassword(data.password) }
        : {}),
    },
  });
  revalidatePath("/nutzer");
}

export async function deleteParentUser(id: string) {
  const session = await requireStudent();
  await prisma.user.deleteMany({
    where: { id, role: "PARENT", managedStudentId: session.userId },
  });
  revalidatePath("/nutzer");
}
