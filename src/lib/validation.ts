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

const email = z.string().trim().email("Ungültige E-Mail").max(200);
const name = z.string().trim().min(1, "Name fehlt").max(100);
const password = z.string().min(8, "Passwort muss mindestens 8 Zeichen haben").max(200);
const optionalPassword = z.preprocess(
  (v) => (v == null || (typeof v === "string" && v.trim() === "") ? undefined : v),
  password.optional(),
);

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
  email,
  password: z.string().min(1, "Passwort fehlt"),
});

export const passwordResetRequestSchema = z.object({
  email,
});

export const passwordResetTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, "Ungültiger Link");

export const passwordResetSchema = z
  .object({
    token: passwordResetTokenSchema,
    password,
    passwordConfirm: z.string().min(1, "Passwort-Bestätigung fehlt"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export const registerSchema = z
  .object({
    name,
    email,
    password,
    passwordConfirm: z.string().min(1, "Passwort-Bestätigung fehlt"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwörter stimmen nicht überein",
    path: ["passwordConfirm"],
  });

export const accountUpdateSchema = z.object({
  name,
  email,
  currentPassword: z.string().optional(),
  password: optionalPassword,
});

export const parentUserCreateSchema = z.object({
  name,
  email,
  password,
});

export const parentUserUpdateSchema = z.object({
  name,
  email,
  password: optionalPassword,
});
