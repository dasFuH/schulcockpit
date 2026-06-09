/**
 * Lese-Abfragen für Dashboard und Wochencheck.
 * Bündelt die Erinnerungslogik (überfällig, heute, diese Woche …).
 */
import type { Prisma, HomeworkStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { heute, morgenStart, dieseWoche, naechsteWoche, addDays } from "./dates";

// Offene Hausaufgaben = nicht erledigt. Bewusst als mutables, typisiertes
// Array – ein "as const"-Readonly-Tupel bricht hier Prismas Typinferenz
// (das include würde verloren gehen).
const OFFENE_STATUS: HomeworkStatus[] = ["OFFEN", "ANGEFANGEN"];

// Wiederverwendbare Payload-Typen (Eintrag inkl. zugehörigem Fach).
type HausaufgabeMitFach = Prisma.HausaufgabeGetPayload<{ include: { fach: true } }>;
type TagesnotizMitFach = Prisma.TagesnotizGetPayload<{ include: { fach: true } }>;
type KlassenarbeitMitFach = Prisma.KlassenarbeitGetPayload<{ include: { fach: true } }>;

/** Alle Fächer eines Nutzers (alphabetisch). */
export function getFaecher(userId: string) {
  return prisma.fach.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/**
 * Daten für das Dashboard (Schüleransicht).
 * Bewusst in mehrere klar benannte Buckets aufgeteilt.
 */
export async function getDashboardData(userId: string) {
  const now = heute();
  const morgen = morgenStart();
  const woche = dieseWoche();

  const [
    ueberfaellig,
    heuteFaellig,
    morgenFaellig,
    dieseWocheFaellig,
    kommendeArbeiten,
    gelbRoteThemen,
    hilfeAufgaben,
  ] = await Promise.all([
    // Überfällige, noch offene Hausaufgaben
    prisma.hausaufgabe.findMany({
      where: {
        userId,
        status: { in: OFFENE_STATUS },
        abgabedatum: { lt: now },
      },
      include: { fach: true },
      orderBy: { abgabedatum: "asc" },
    }),
    // Heute fällig
    prisma.hausaufgabe.findMany({
      where: {
        userId,
        status: { in: OFFENE_STATUS },
        abgabedatum: { gte: now, lt: morgen },
      },
      include: { fach: true },
      orderBy: { abgabedatum: "asc" },
    }),
    // Morgen fällig
    prisma.hausaufgabe.findMany({
      where: {
        userId,
        status: { in: OFFENE_STATUS },
        abgabedatum: { gte: morgen, lt: addDays(morgen, 1) },
      },
      include: { fach: true },
      orderBy: { abgabedatum: "asc" },
    }),
    // Diese Woche fällig (ab übermorgen bis Wochenende)
    prisma.hausaufgabe.findMany({
      where: {
        userId,
        status: { in: OFFENE_STATUS },
        abgabedatum: { gte: addDays(morgen, 1), lte: woche.ende },
      },
      include: { fach: true },
      orderBy: { abgabedatum: "asc" },
    }),
    // Anstehende Klassenarbeiten (nächste 21 Tage)
    prisma.klassenarbeit.findMany({
      where: {
        userId,
        datum: { gte: now, lte: addDays(now, 21) },
      },
      include: { fach: true },
      orderBy: { datum: "asc" },
    }),
    // Gelbe/rote Themen aus Tagesnotizen (letzte 30 Tage)
    prisma.tagesnotiz.findMany({
      where: {
        userId,
        verstandenStatus: { in: ["GELB", "ROT"] },
        datum: { gte: addDays(now, -30) },
      },
      include: { fach: true },
      orderBy: [{ verstandenStatus: "desc" }, { datum: "desc" }],
    }),
    // Aufgaben mit Hilfebedarf
    prisma.hausaufgabe.findMany({
      where: { userId, hilfeNoetig: true, status: { in: OFFENE_STATUS } },
      include: { fach: true },
      orderBy: { abgabedatum: "asc" },
    }),
  ]);

  return {
    ueberfaellig,
    heuteFaellig,
    morgenFaellig,
    dieseWocheFaellig,
    kommendeArbeiten,
    gelbRoteThemen,
    hilfeAufgaben,
  };
}

/**
 * Daten für den Wochencheck (Fokus Sonntag → nächste Woche planen).
 */
export async function getWochencheckData(userId: string) {
  const now = heute();
  const naechste = naechsteWoche();

  const [offeneHausaufgaben, kommendeAbgaben, kommendeArbeiten, unklareThemen] =
    await Promise.all([
      // Alle offenen Hausaufgaben (Rückstand sichtbar machen)
      prisma.hausaufgabe.findMany({
        where: { userId, status: { in: OFFENE_STATUS } },
        include: { fach: true },
        orderBy: { abgabedatum: "asc" },
      }),
      // Abgaben der nächsten Woche
      prisma.hausaufgabe.findMany({
        where: {
          userId,
          status: { in: OFFENE_STATUS },
          abgabedatum: { gte: naechste.start, lte: naechste.ende },
        },
        include: { fach: true },
        orderBy: { abgabedatum: "asc" },
      }),
      // Klassenarbeiten der nächsten 4 Wochen
      prisma.klassenarbeit.findMany({
        where: { userId, datum: { gte: now, lte: addDays(now, 28) } },
        include: { fach: true },
        orderBy: { datum: "asc" },
      }),
      // Unklare (gelb/rot) Themen
      prisma.tagesnotiz.findMany({
        where: {
          userId,
          verstandenStatus: { in: ["GELB", "ROT"] },
          datum: { gte: addDays(now, -30) },
        },
        include: { fach: true },
        orderBy: [{ verstandenStatus: "desc" }, { datum: "desc" }],
      }),
    ]);

  return { offeneHausaufgaben, kommendeAbgaben, kommendeArbeiten, unklareThemen };
}

/**
 * Reduzierte Daten für die Elternansicht (nur grober Überblick).
 */
export async function getElternUebersicht(userId: string): Promise<{
  offeneAufgaben: number;
  kommendeArbeiten: KlassenarbeitMitFach[];
  roteThemen: TagesnotizMitFach[];
  hilfebedarf: HausaufgabeMitFach[];
}> {
  const now = heute();

  // count() getrennt halten – sonst bricht die Tupel-Typinferenz von Promise.all.
  const offeneAufgaben = await prisma.hausaufgabe.count({
    where: { userId, status: { in: OFFENE_STATUS } },
  });

  const kommendeArbeiten = await prisma.klassenarbeit.findMany({
    where: { userId, datum: { gte: now, lte: addDays(now, 21) } },
    include: { fach: true },
    orderBy: { datum: "asc" },
  });
  const roteThemen = await prisma.tagesnotiz.findMany({
    where: {
      userId,
      verstandenStatus: "ROT",
      datum: { gte: addDays(now, -30) },
    },
    include: { fach: true },
    orderBy: { datum: "desc" },
  });
  const hilfebedarf = await prisma.hausaufgabe.findMany({
    where: { userId, hilfeNoetig: true, status: { in: OFFENE_STATUS } },
    include: { fach: true },
    orderBy: { abgabedatum: "asc" },
  });

  return { offeneAufgaben, kommendeArbeiten, roteThemen, hilfebedarf };
}

/** Findet das mit einem Elternkonto verknüpfte Schülerkonto. */
export async function getLinkedSchuelerUserId(parentUserId: string): Promise<string | null> {
  const parent = await prisma.user.findFirst({
    where: { id: parentUserId, role: "PARENT" },
    select: { managedStudentId: true },
  });
  return parent?.managedStudentId ?? null;
}
