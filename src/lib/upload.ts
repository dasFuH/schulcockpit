/**
 * Lokaler Datei-Upload-Helfer. Speichert Uploads im UPLOAD_DIR
 * (Standard: ./uploads) und legt einen Dateianhang-Datensatz an.
 *
 * Bewusst einfach gehalten (kein MinIO/S3 im MVP).
 */
import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import type { EntityTyp } from "@prisma/client";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ERLAUBTE_TYPEN = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

export function uploadVerzeichnis(): string {
  return path.isAbsolute(UPLOAD_DIR)
    ? UPLOAD_DIR
    : path.join(process.cwd(), UPLOAD_DIR);
}

/**
 * Speichert eine hochgeladene Datei und verknüpft sie mit einer Entität.
 * Gibt den erstellten Dateianhang zurück.
 */
export async function speichereAnhang(
  file: File,
  entityTyp: EntityTyp,
  entityId: string,
): Promise<{ ok: true } | { ok: false; fehler: string }> {
  if (file.size === 0) return { ok: false, fehler: "Leere Datei." };
  if (file.size > MAX_BYTES) {
    return { ok: false, fehler: "Datei ist größer als 10 MB." };
  }
  if (!ERLAUBTE_TYPEN.includes(file.type)) {
    return { ok: false, fehler: `Dateityp nicht erlaubt: ${file.type}` };
  }

  const ext = path.extname(file.name) || mimeZuExt(file.type);
  const dateiname = `${randomUUID()}${ext}`;
  // Unterordner pro Entitätstyp für Übersicht
  const relPfad = path.join(entityTyp.toLowerCase(), dateiname);
  const zielOrdner = path.join(uploadVerzeichnis(), entityTyp.toLowerCase());
  const zielPfad = path.join(zielOrdner, dateiname);

  await mkdir(zielOrdner, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(zielPfad, bytes);

  const verknuepfung =
    entityTyp === "HAUSAUFGABE"
      ? { hausaufgabeId: entityId }
      : entityTyp === "TAGESNOTIZ"
        ? { tagesnotizId: entityId }
        : { klassenarbeitId: entityId };

  await prisma.dateianhang.create({
    data: {
      entityTyp,
      entityId,
      dateiname: file.name,
      pfad: relPfad.replace(/\\/g, "/"),
      mimeType: file.type,
      groesse: file.size,
      ...verknuepfung,
    },
  });

  return { ok: true };
}

function mimeZuExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
      return ".heic";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}
