"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, canWrite } from "@/lib/auth";
import { hausaufgabeSchema } from "@/lib/validation";
import { speichereAnhang } from "@/lib/upload";
import type { HomeworkStatus } from "@prisma/client";

async function requireWrite() {
  const session = await requireSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

/** Liest die Felder aus dem FormData und validiert sie. */
function parseForm(formData: FormData) {
  return hausaufgabeSchema.parse({
    fachId: formData.get("fachId"),
    titel: formData.get("titel"),
    beschreibung: formData.get("beschreibung"),
    abgabedatum: formData.get("abgabedatum"),
    aufwandMinuten: formData.get("aufwandMinuten") || undefined,
    status: formData.get("status") || "OFFEN",
    hilfeNoetig: formData.get("hilfeNoetig") === "on",
  });
}

/** Optionalen Datei-Anhang verarbeiten. */
async function handleUpload(formData: FormData, hausaufgabeId: string) {
  const file = formData.get("anhang");
  if (file instanceof File && file.size > 0) {
    await speichereAnhang(file, "HAUSAUFGABE", hausaufgabeId);
  }
}

export async function createHausaufgabe(formData: FormData) {
  const session = await requireWrite();
  const data = parseForm(formData);

  const ha = await prisma.hausaufgabe.create({
    data: { ...data, userId: session.userId },
  });
  await handleUpload(formData, ha.id);

  revalidatePath("/hausaufgaben");
  revalidatePath("/");
}

export async function updateHausaufgabe(id: string, formData: FormData) {
  const session = await requireWrite();
  const data = parseForm(formData);

  await prisma.hausaufgabe.updateMany({
    where: { id, userId: session.userId },
    data,
  });
  await handleUpload(formData, id);

  revalidatePath("/hausaufgaben");
  revalidatePath("/");
}

/** Schnell-Aktion: Status direkt umschalten (für 1-Tipp-Bedienung). */
export async function setHausaufgabeStatus(id: string, status: HomeworkStatus) {
  const session = await requireWrite();
  await prisma.hausaufgabe.updateMany({
    where: { id, userId: session.userId },
    data: { status },
  });
  revalidatePath("/hausaufgaben");
  revalidatePath("/");
}

export async function deleteHausaufgabe(id: string) {
  const session = await requireWrite();
  await prisma.hausaufgabe.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/hausaufgaben");
  revalidatePath("/");
}
