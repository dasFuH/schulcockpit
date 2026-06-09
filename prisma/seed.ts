/**
 * Seed-Skript: legt ein Demo-Schülerkonto, ein Elternkonto und
 * ein paar Beispiel-Fächer + Einträge an, damit die App sofort
 * mit realistischen Daten erlebbar ist.
 *
 * Ausführen:  npm run db:seed
 */
import { PrismaClient, Role, HomeworkStatus, Ampel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function inDays(days: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const studentPw = await bcrypt.hash("schueler123", 10);
  const parentPw = await bcrypt.hash("eltern123", 10);

  // Schülerin (Hauptnutzerin)
  const schuelerin = await prisma.user.upsert({
    where: { email: "schuelerin@cockpit.local" },
    update: {},
    create: {
      email: "schuelerin@cockpit.local",
      name: "Mia",
      passwordHash: studentPw,
      role: Role.STUDENT,
    },
  });

  // Elternteil (nur Überblick)
  await prisma.user.upsert({
    where: { email: "eltern@cockpit.local" },
    update: {
      managedStudentId: schuelerin.id,
    },
    create: {
      email: "eltern@cockpit.local",
      name: "Elternteil",
      passwordHash: parentPw,
      role: Role.PARENT,
      managedStudentId: schuelerin.id,
    },
  });

  // Falls schon Fächer existieren, nicht doppelt anlegen
  const vorhandene = await prisma.fach.count({ where: { userId: schuelerin.id } });
  if (vorhandene > 0) {
    console.log("Seed: Fächer existieren bereits, überspringe Demo-Daten.");
    return;
  }

  const mathe = await prisma.fach.create({
    data: { name: "Mathe", farbe: "#3b82f6", lehrer: "Frau Berg", userId: schuelerin.id },
  });
  const deutsch = await prisma.fach.create({
    data: { name: "Deutsch", farbe: "#ef4444", lehrer: "Herr Klein", userId: schuelerin.id },
  });
  const englisch = await prisma.fach.create({
    data: { name: "Englisch", farbe: "#22c55e", lehrer: "Ms. Young", userId: schuelerin.id },
  });

  await prisma.hausaufgabe.createMany({
    data: [
      {
        fachId: mathe.id,
        userId: schuelerin.id,
        titel: "Arbeitsblatt Bruchrechnung",
        beschreibung: "Aufgaben 1–8 auf Seite 42",
        abgabedatum: inDays(1),
        aufwandMinuten: 30,
        status: HomeworkStatus.OFFEN,
        hilfeNoetig: true,
      },
      {
        fachId: deutsch.id,
        userId: schuelerin.id,
        titel: "Gedichtanalyse",
        beschreibung: "Strophen markieren, Reimschema bestimmen",
        abgabedatum: inDays(3),
        aufwandMinuten: 45,
        status: HomeworkStatus.ANGEFANGEN,
      },
      {
        fachId: englisch.id,
        userId: schuelerin.id,
        titel: "Vokabeln Unit 5",
        abgabedatum: inDays(-1), // überfällig
        aufwandMinuten: 20,
        status: HomeworkStatus.OFFEN,
      },
    ],
  });

  await prisma.tagesnotiz.createMany({
    data: [
      {
        datum: inDays(0),
        fachId: mathe.id,
        userId: schuelerin.id,
        thema: "Brüche kürzen",
        zusammenfassung: "ggT zum Kürzen benutzen",
        verstandenStatus: Ampel.GELB,
        unklarheiten: "Wann ist ein Bruch vollständig gekürzt?",
        klassenarbeitRelevant: true,
      },
      {
        datum: inDays(0),
        fachId: englisch.id,
        userId: schuelerin.id,
        thema: "Simple Past",
        zusammenfassung: "Regelmäßige Verben mit -ed",
        verstandenStatus: Ampel.GRUEN,
      },
    ],
  });

  await prisma.klassenarbeit.create({
    data: {
      fachId: mathe.id,
      userId: schuelerin.id,
      datum: inDays(9),
      titel: "Mathe-Arbeit Bruchrechnung",
      themen: "Brüche kürzen\nBrüche addieren\nGemischte Zahlen",
      materialien: "Heft, Arbeitsblätter Woche 3–4",
      lernstatus: Ampel.ROT,
      notiz: "Frau Berg sagt: Fokus auf Textaufgaben.",
    },
  });

  console.log("Seed abgeschlossen ✅");
  console.log("  Schülerin:  schuelerin@cockpit.local / schueler123");
  console.log("  Eltern:     eltern@cockpit.local / eltern123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
