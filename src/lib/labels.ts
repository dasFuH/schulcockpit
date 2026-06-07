/**
 * Zentrale Anzeige-Labels und Farben für die Enums.
 * Hält UI-Texte an einer Stelle (einfache Sprache, deutsch).
 */
import type {
  HomeworkStatus,
  Ampel,
  Prioritaet,
  LearnTaskStatus,
} from "@prisma/client";

export const homeworkStatusLabel: Record<HomeworkStatus, string> = {
  OFFEN: "Offen",
  ANGEFANGEN: "Angefangen",
  ERLEDIGT: "Erledigt",
};

export const homeworkStatusFarbe: Record<HomeworkStatus, string> = {
  OFFEN: "bg-gray-100 text-gray-700",
  ANGEFANGEN: "bg-amber-100 text-amber-800",
  ERLEDIGT: "bg-green-100 text-green-800",
};

export const ampelLabel: Record<Ampel, string> = {
  GRUEN: "Verstanden",
  GELB: "Teilweise",
  ROT: "Unklar",
};

export const ampelEmoji: Record<Ampel, string> = {
  GRUEN: "🟢",
  GELB: "🟡",
  ROT: "🔴",
};

export const ampelFarbe: Record<Ampel, string> = {
  GRUEN: "bg-ampel-gruen",
  GELB: "bg-ampel-gelb",
  ROT: "bg-ampel-rot",
};

export const ampelBadge: Record<Ampel, string> = {
  GRUEN: "bg-green-100 text-green-800",
  GELB: "bg-yellow-100 text-yellow-800",
  ROT: "bg-red-100 text-red-800",
};

export const prioritaetLabel: Record<Prioritaet, string> = {
  NIEDRIG: "Niedrig",
  MITTEL: "Mittel",
  HOCH: "Hoch",
};

export const learnTaskStatusLabel: Record<LearnTaskStatus, string> = {
  OFFEN: "Offen",
  ANGEFANGEN: "Angefangen",
  ERLEDIGT: "Erledigt",
};

/** Vordefinierte Fach-Farben für die schnelle Auswahl. */
export const fachFarben: { name: string; wert: string }[] = [
  { name: "Blau", wert: "#3b82f6" },
  { name: "Rot", wert: "#ef4444" },
  { name: "Grün", wert: "#22c55e" },
  { name: "Violett", wert: "#8b5cf6" },
  { name: "Orange", wert: "#f97316" },
  { name: "Türkis", wert: "#14b8a6" },
  { name: "Pink", wert: "#ec4899" },
  { name: "Grau", wert: "#64748b" },
];
