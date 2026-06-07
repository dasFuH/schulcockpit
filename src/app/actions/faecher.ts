"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, canWrite } from "@/lib/auth";
import { fachSchema } from "@/lib/validation";

/** Stellt sicher, dass nur Schüler:innen schreiben dürfen. */
async function requireWrite() {
  const session = await requireSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

export async function createFach(formData: FormData) {
  const session = await requireWrite();
  const data = fachSchema.parse({
    name: formData.get("name"),
    farbe: formData.get("farbe") || "#6366f1",
    lehrer: formData.get("lehrer"),
  });

  await prisma.fach.create({
    data: { ...data, userId: session.userId },
  });
  revalidatePath("/faecher");
}

export async function updateFach(id: string, formData: FormData) {
  const session = await requireWrite();
  const data = fachSchema.parse({
    name: formData.get("name"),
    farbe: formData.get("farbe") || "#6366f1",
    lehrer: formData.get("lehrer"),
  });

  // Nur eigene Fächer ändern
  await prisma.fach.updateMany({
    where: { id, userId: session.userId },
    data,
  });
  revalidatePath("/faecher");
}

export async function deleteFach(id: string) {
  const session = await requireWrite();
  await prisma.fach.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/faecher");
}
