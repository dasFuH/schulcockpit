-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'PARENT');

-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('OFFEN', 'ANGEFANGEN', 'ERLEDIGT');

-- CreateEnum
CREATE TYPE "Ampel" AS ENUM ('GRUEN', 'GELB', 'ROT');

-- CreateEnum
CREATE TYPE "LearnTaskStatus" AS ENUM ('OFFEN', 'ANGEFANGEN', 'ERLEDIGT');

-- CreateEnum
CREATE TYPE "Prioritaet" AS ENUM ('NIEDRIG', 'MITTEL', 'HOCH');

-- CreateEnum
CREATE TYPE "QuelleTyp" AS ENUM ('KLASSENARBEIT', 'TAGESNOTIZ', 'MANUELL');

-- CreateEnum
CREATE TYPE "EntityTyp" AS ENUM ('HAUSAUFGABE', 'TAGESNOTIZ', 'KLASSENARBEIT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faecher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farbe" TEXT NOT NULL DEFAULT '#6366f1',
    "lehrer" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faecher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hausaufgaben" (
    "id" TEXT NOT NULL,
    "fachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "abgabedatum" TIMESTAMP(3) NOT NULL,
    "aufwandMinuten" INTEGER,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'OFFEN',
    "hilfeNoetig" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hausaufgaben_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagesnotizen" (
    "id" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "fachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "thema" TEXT NOT NULL,
    "zusammenfassung" TEXT,
    "verstandenStatus" "Ampel" NOT NULL DEFAULT 'GELB',
    "unklarheiten" TEXT,
    "klassenarbeitRelevant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagesnotizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "klassenarbeiten" (
    "id" TEXT NOT NULL,
    "fachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "titel" TEXT NOT NULL,
    "themen" TEXT,
    "materialien" TEXT,
    "lernstatus" "Ampel" NOT NULL DEFAULT 'ROT',
    "notiz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "klassenarbeiten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lernaufgaben" (
    "id" TEXT NOT NULL,
    "fachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quelleTyp" "QuelleTyp" NOT NULL DEFAULT 'MANUELL',
    "quelleId" TEXT,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "faelligAm" TIMESTAMP(3),
    "status" "LearnTaskStatus" NOT NULL DEFAULT 'OFFEN',
    "prioritaet" "Prioritaet" NOT NULL DEFAULT 'MITTEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lernaufgaben_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dateianhaenge" (
    "id" TEXT NOT NULL,
    "entityTyp" "EntityTyp" NOT NULL,
    "entityId" TEXT NOT NULL,
    "dateiname" TEXT NOT NULL,
    "pfad" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "groesse" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hausaufgabeId" TEXT,
    "tagesnotizId" TEXT,
    "klassenarbeitId" TEXT,

    CONSTRAINT "dateianhaenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "faecher_userId_idx" ON "faecher"("userId");

-- CreateIndex
CREATE INDEX "hausaufgaben_userId_idx" ON "hausaufgaben"("userId");

-- CreateIndex
CREATE INDEX "hausaufgaben_fachId_idx" ON "hausaufgaben"("fachId");

-- CreateIndex
CREATE INDEX "hausaufgaben_abgabedatum_idx" ON "hausaufgaben"("abgabedatum");

-- CreateIndex
CREATE INDEX "tagesnotizen_userId_idx" ON "tagesnotizen"("userId");

-- CreateIndex
CREATE INDEX "tagesnotizen_fachId_idx" ON "tagesnotizen"("fachId");

-- CreateIndex
CREATE INDEX "tagesnotizen_datum_idx" ON "tagesnotizen"("datum");

-- CreateIndex
CREATE INDEX "klassenarbeiten_userId_idx" ON "klassenarbeiten"("userId");

-- CreateIndex
CREATE INDEX "klassenarbeiten_fachId_idx" ON "klassenarbeiten"("fachId");

-- CreateIndex
CREATE INDEX "klassenarbeiten_datum_idx" ON "klassenarbeiten"("datum");

-- CreateIndex
CREATE INDEX "lernaufgaben_userId_idx" ON "lernaufgaben"("userId");

-- CreateIndex
CREATE INDEX "lernaufgaben_fachId_idx" ON "lernaufgaben"("fachId");

-- CreateIndex
CREATE INDEX "dateianhaenge_entityTyp_entityId_idx" ON "dateianhaenge"("entityTyp", "entityId");

-- AddForeignKey
ALTER TABLE "faecher" ADD CONSTRAINT "faecher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hausaufgaben" ADD CONSTRAINT "hausaufgaben_fachId_fkey" FOREIGN KEY ("fachId") REFERENCES "faecher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hausaufgaben" ADD CONSTRAINT "hausaufgaben_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagesnotizen" ADD CONSTRAINT "tagesnotizen_fachId_fkey" FOREIGN KEY ("fachId") REFERENCES "faecher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagesnotizen" ADD CONSTRAINT "tagesnotizen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "klassenarbeiten" ADD CONSTRAINT "klassenarbeiten_fachId_fkey" FOREIGN KEY ("fachId") REFERENCES "faecher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "klassenarbeiten" ADD CONSTRAINT "klassenarbeiten_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lernaufgaben" ADD CONSTRAINT "lernaufgaben_fachId_fkey" FOREIGN KEY ("fachId") REFERENCES "faecher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lernaufgaben" ADD CONSTRAINT "lernaufgaben_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lernaufgaben" ADD CONSTRAINT "lernaufgaben_quelleId_fkey" FOREIGN KEY ("quelleId") REFERENCES "klassenarbeiten"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dateianhaenge" ADD CONSTRAINT "dateianhaenge_hausaufgabeId_fkey" FOREIGN KEY ("hausaufgabeId") REFERENCES "hausaufgaben"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dateianhaenge" ADD CONSTRAINT "dateianhaenge_tagesnotizId_fkey" FOREIGN KEY ("tagesnotizId") REFERENCES "tagesnotizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dateianhaenge" ADD CONSTRAINT "dateianhaenge_klassenarbeitId_fkey" FOREIGN KEY ("klassenarbeitId") REFERENCES "klassenarbeiten"("id") ON DELETE CASCADE ON UPDATE CASCADE;

