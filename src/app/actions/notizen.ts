"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, canWrite } from "@/lib/auth";
import { tagesnotizSchema } from "@/lib/validation";
import { speichereAnhang } from "@/lib/upload";

async function requireWrite() {
  const session = await requireSession();
  if (!canWrite(session.role)) throw new Error("FORBIDDEN");
  return session;
}

function parseForm(formData: FormData) {
  return tagesnotizSchema.parse({
    fachId: formData.get("fachId"),
    datum: formData.get("datum"),
    thema: formData.get("thema"),
    zusammenfassung: formData.get("zusammenfassung"),
    verstandenStatus: formData.get("verstandenStatus") || "GELB",
    unklarheiten: formData.get("unklarheiten"),
    klassenarbeitRelevant: formData.get("klassenarbeitRelevant") === "on",
  });
}

async function handleUpload(formData: FormData, notizId: string) {
  const file = formData.get("anhang");
  if (file instanceof File && file.size > 0) {
    await speichereAnhang(file, "TAGESNOTIZ", notizId);
  }
}

export async function createTagesnotiz(formData: FormData) {
  const session = await requireWrite();
  const data = parseForm(formData);

  const notiz = await prisma.tagesnotiz.create({
    data: { ...data, userId: session.userId },
  });
  await handleUpload(formData, notiz.id);

  revalidatePath("/notizen");
  revalidatePath("/");
}

export async function updateTagesnotiz(id: string, formData: FormData) {
  const session = await requireWrite();
  const data = parseForm(formData);

  await prisma.tagesnotiz.updateMany({
    where: { id, userId: session.userId },
    data,
  });
  await handleUpload(formData, id);

  revalidatePath("/notizen");
  revalidatePath("/");
}

export async function deleteTagesnotiz(id: string) {
  const session = await requireWrite();
  await prisma.tagesnotiz.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/notizen");
  revalidatePath("/");
}
