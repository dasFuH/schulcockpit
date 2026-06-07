/**
 * Zod-Schemata zur Validierung der Formular-Eingaben in Server Actions.
 */
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const fachSchema = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(60),
  farbe: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Ungültige Farbe")
    .default("#6366f1"),
  lehrer: optionalText,
});

export const hausaufgabeSchema = z.object({
  fachId: z.string().min(1, "Fach wählen"),
  titel: z.string().trim().min(1, "Titel fehlt").max(200),
  beschreibung: optionalText,
  abgabedatum: z.coerce.date({ message: "Abgabedatum fehlt" }),
  aufwandMinuten: z.coerce
    .number()
    .int()
    .min(0)
    .max(600)
    .optional()
    .or(z.literal(NaN).transform(() => undefined)),
  status: z.enum(["OFFEN", "ANGEFANGEN", "ERLEDIGT"]).default("OFFEN"),
  hilfeNoetig: z.coerce.boolean().default(false),
});

export const tagesnotizSchema = z.object({
  fachId: z.string().min(1, "Fach wählen"),
  datum: z.coerce.date({ message: "Datum fehlt" }),
  thema: z.string().trim().min(1, "Thema fehlt").max(200),
  zusammenfassung: optionalText,
  verstandenStatus: z.enum(["GRUEN", "GELB", "ROT"]).default("GELB"),
  unklarheiten: optionalText,
  klassenarbeitRelevant: z.coerce.boolean().default(false),
});

export const klassenarbeitSchema = z.object({
  fachId: z.string().min(1, "Fach wählen"),
  datum: z.coerce.date({ message: "Datum fehlt" }),
  titel: z.string().trim().min(1, "Titel fehlt").max(200),
  themen: optionalText,
  materialien: optionalText,
  lernstatus: z.enum(["GRUEN", "GELB", "ROT"]).default("ROT"),
  notiz: optionalText,
});

export const lernaufgabeSchema = z.object({
  fachId: z.string().min(1, "Fach wählen"),
  titel: z.string().trim().min(1, "Titel fehlt").max(200),
  beschreibung: optionalText,
  faelligAm: z.coerce.date().optional().or(z.literal("").transform(() => undefined)),
  prioritaet: z.enum(["NIEDRIG", "MITTEL", "HOCH"]).default("MITTEL"),
  status: z.enum(["OFFEN", "ANGEFANGEN", "ERLEDIGT"]).default("OFFEN"),
  quelleTyp: z.enum(["KLASSENARBEIT", "TAGESNOTIZ", "MANUELL"]).default("MANUELL"),
  quelleId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Ungültige E-Mail"),
  password: z.string().min(1, "Passwort fehlt"),
});
