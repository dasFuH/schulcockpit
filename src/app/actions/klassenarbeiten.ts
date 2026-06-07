"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, canWrite } from "@/lib/auth";
import { klassenarbeitSchema } from "@/lib/validation";
import { speichereAnhang } from "@/lib/upload";
import type { Ampel } from "@prisma/client";

async function requireWrite() {
  const session = await requireSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

function parseForm(formData: FormData) {
  return klassenarbeitSchema.parse({
    fachId: formData.get("fachId"),
    datum: formData.get("datum"),
    titel: formData.get("titel"),
    themen: formData.get("themen"),
    materialien: formData.get("materialien"),
    lernstatus: formData.get("lernstatus") || "ROT",
    notiz: formData.get("notiz"),
  });
}

async function handleUpload(formData: FormData, id: string) {
  const file = formData.get("anhang");
  if (file instanceof File && file.size > 0) {
    await speichereAnhang(file, "KLASSENARBEIT", id);
  }
}

export async function createKlassenarbeit(formData: FormData) {
  const session = await requireWrite();
  const data = parseForm(formData);

  const ka = await prisma.klassenarbeit.create({
    data: { ...data, userId: session.userId },
  });
  await handleUpload(formData, ka.id);

  revalidatePath("/klassenarbeiten");
  revalidatePath("/");
}

export async function updateKlassenarbeit(id: string, formData: FormData) {
  const session = await requireWrite();
  const data = parseForm(formData);

  await prisma.klassenarbeit.updateMany({
    where: { id, userId: session.userId },
    data,
  });
  await handleUpload(formData, id);

  revalidatePath("/klassenarbeiten");
  revalidatePath("/");
}

/** Schnell-Aktion: Lernstatus-Ampel umschalten. */
export async function setKlassenarbeitLernstatus(id: string, lernstatus: Ampel) {
  const session = await requireWrite();
  await prisma.klassenarbeit.updateMany({
    where: { id, userId: session.userId },
    data: { lernstatus },
  });
  revalidatePath("/klassenarbeiten");
  revalidatePath("/");
}

export async function deleteKlassenarbeit(id: string) {
  const session = await requireWrite();
  await prisma.klassenarbeit.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/klassenarbeiten");
  revalidatePath("/");
}
