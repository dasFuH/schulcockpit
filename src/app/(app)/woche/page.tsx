import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession, canWrite } from "@/lib/auth";
import { getWochencheckData } from "@/lib/queries";
import { FachBadge, AmpelChip, EmptyState, SectionTitle } from "@/components/ui";
import { faelligkeitLabel, tageBis, istUeberfaellig } from "@/lib/dates";

export const metadata = { title: "Wochencheck · Schul-Cockpit" };

/**
 * Erzeugt einfache, konkrete Lernplan-Vorschläge:
 * - Klassenarbeiten in den nächsten 14 Tagen → Lerneinheit empfehlen
 * - unklare (gelb/rot) Themen → Wiederholung empfehlen
 * - überfällige/offene Aufgaben → zuerst erledigen
 */
function baueVorschlaege(d: Awaited<ReturnType<typeof getWochencheckData>>) {
  const vorschlaege: { icon: string; text: string; ton: "rot" | "gelb" | "blau" }[] = [];

  const ueberfaellig = d.offeneHausaufgaben.filter((h) =>
    istUeberfaellig(h.abgabedatum),
  );
  if (ueberfaellig.length > 0) {
    vorschlaege.push({
      icon: "⏰",
      ton: "rot",
      text: `Zuerst ${ueberfaellig.length} überfällige Aufgabe(n) nachholen.`,
    });
  }

  for (const ka of d.kommendeArbeiten) {
    const tage = tageBis(ka.datum);
    if (tage <= 14) {
      const dringend = tage <= 5;
      vorschlaege.push({
        icon: "🎯",
        ton: dringend ? "rot" : "gelb",
        text: `${ka.fach.name}: „${ka.titel}" in ${tage} Tagen – ${
          dringend ? "jetzt täglich üben" : "diese Woche mit dem Lernen starten"
        }.`,
      });
    }
  }

  const rote = d.unklareThemen.filter((t) => t.verstandenStatus === "ROT");
  if (rote.length > 0) {
    vorschlaege.push({
      icon: "🔴",
      ton: "rot",
      text: `${rote.length} unklare Themen wiederholen oder nachfragen.`,
    });
  }

  if (d.kommendeAbgaben.length > 0) {
    vorschlaege.push({
      icon: "📤",
      ton: "blau",
      text: `${d.kommendeAbgaben.length} Abgabe(n) nächste Woche einplanen.`,
    });
  }

  if (vorschlaege.length === 0) {
    vorschlaege.push({
      icon: "🌟",
      ton: "blau",
      text: "Gerade ist alles im grünen Bereich. Genieß das Wochenende!",
    });
  }

  return vorschlaege;
}

const tonFarbe: Record<string, string> = {
  rot: "bg-red-50 text-red-800 ring-red-100",
  gelb: "bg-amber-50 text-amber-800 ring-amber-100",
  blau: "bg-indigo-50 text-indigo-800 ring-indigo-100",
};

export default async function WochePage() {
  const session = await requireSession();
  if (!canWrite(session.role)) redirect("/");

  const d = await getWochencheckData(session.userId);
  const vorschlaege = baueVorschlaege(d);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wochencheck</h1>
        <p className="text-sm text-slate-500">
          Perfekt für Sonntagabend: kurz sortieren, was nächste Woche wichtig
          ist.
        </p>
      </div>

      {/* Lernplan-Vorschlag */}
      <section>
        <SectionTitle>🧭 Vorschlag für nächste Woche</SectionTitle>
        <div className="space-y-2">
          {vorschlaege.map((v, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl px-3 py-3 text-sm ring-1 ${tonFarbe[v.ton]}`}
            >
              <span className="text-lg leading-none">{v.icon}</span>
              <span>{v.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Offene Hausaufgaben */}
      <section>
        <SectionTitle count={d.offeneHausaufgaben.length}>
          📝 Offene Hausaufgaben
        </SectionTitle>
        {d.offeneHausaufgaben.length === 0 ? (
          <EmptyState emoji="✅" text="Keine offenen Hausaufgaben." />
        ) : (
          <div className="space-y-2">
            {d.offeneHausaufgaben.map((h) => (
              <Link
                key={h.id}
                href="/hausaufgaben"
                className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: h.fach.farbe }}
                  />
                  <span className="truncate text-sm">{h.titel}</span>
                </div>
                <span
                  className={`shrink-0 text-xs ${
                    istUeberfaellig(h.abgabedatum)
                      ? "font-semibold text-red-600"
                      : "text-slate-400"
                  }`}
                >
                  {faelligkeitLabel(h.abgabedatum)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Kommende Klassenarbeiten */}
      {d.kommendeArbeiten.length > 0 && (
        <section>
          <SectionTitle count={d.kommendeArbeiten.length}>
            🎯 Kommende Klassenarbeiten
          </SectionTitle>
          <div className="space-y-2">
            {d.kommendeArbeiten.map((ka) => (
              <Link
                key={ka.id}
                href="/klassenarbeiten"
                className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FachBadge name={ka.fach.name} farbe={ka.fach.farbe} />
                  <span className="truncate text-sm">{ka.titel}</span>
                </div>
                <span className="shrink-0 text-xs font-medium text-slate-500">
                  {faelligkeitLabel(ka.datum)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Unklare Themen */}
      {d.unklareThemen.length > 0 && (
        <section>
          <SectionTitle count={d.unklareThemen.length}>
            🧩 Unklare Themen
          </SectionTitle>
          <div className="space-y-2">
            {d.unklareThemen.map((t) => (
              <Link
                key={t.id}
                href="/notizen"
                className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: t.fach.farbe }}
                  />
                  <span className="truncate text-sm">{t.thema}</span>
                </div>
                <AmpelChip status={t.verstandenStatus} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
