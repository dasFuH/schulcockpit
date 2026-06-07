/**
 * Datums-Hilfsfunktionen rund um die Erinnerungslogik.
 * Alle Vergleiche arbeiten auf Tagesebene (lokale Zeit).
 */
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  isBefore,
  isAfter,
  differenceInCalendarDays,
} from "date-fns";

export function heute(): Date {
  return startOfDay(new Date());
}

export function tagesEnde(d: Date = new Date()): Date {
  return endOfDay(d);
}

export function morgenStart(): Date {
  return startOfDay(addDays(new Date(), 1));
}

/** Woche Montag–Sonntag (deutsche Konvention). */
export function dieseWoche(): { start: Date; ende: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    ende: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

export function naechsteWoche(): { start: Date; ende: Date } {
  const now = addDays(new Date(), 7);
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    ende: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

/** Tage bis zu einem Datum (negativ = überfällig). */
export function tageBis(datum: Date): number {
  return differenceInCalendarDays(startOfDay(datum), heute());
}

/** Überfällig = Abgabedatum liegt vor heute. */
export function istUeberfaellig(datum: Date): boolean {
  return isBefore(startOfDay(datum), heute());
}

export function istHeute(datum: Date): boolean {
  return differenceInCalendarDays(startOfDay(datum), heute()) === 0;
}

export function istMorgen(datum: Date): boolean {
  return differenceInCalendarDays(startOfDay(datum), heute()) === 1;
}

export { isBefore, isAfter, addDays };

/** Menschlich lesbares Fälligkeits-Label. */
export function faelligkeitLabel(datum: Date): string {
  const tage = tageBis(datum);
  if (tage < 0) return `${Math.abs(tage)} Tag(e) überfällig`;
  if (tage === 0) return "Heute fällig";
  if (tage === 1) return "Morgen fällig";
  if (tage <= 7) return `In ${tage} Tagen`;
  return datum.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Formatiert ein Datum als YYYY-MM-DD für <input type="date">. */
export function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDatum(d: Date): string {
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}
