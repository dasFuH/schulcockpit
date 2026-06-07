/**
 * Elternansicht: bewusst grob und nicht kontrollierend.
 * Zeigt nur Zahlen + die wirklich wichtigen Signale
 * (rote Themen, Hilfebedarf, anstehende Arbeiten).
 */
import { FachBadge, EmptyState } from "@/components/ui";
import { faelligkeitLabel } from "@/lib/dates";
import type { getElternUebersicht } from "@/lib/queries";

// Typ direkt aus der Query ableiten – so bleibt er immer synchron.
type ElternData = Awaited<ReturnType<typeof getElternUebersicht>>;

function StatCard({
  zahl,
  label,
  ton = "neutral",
}: {
  zahl: number;
  label: string;
  ton?: "neutral" | "warn" | "alarm";
}) {
  const farben = {
    neutral: "bg-white text-slate-900 ring-slate-100",
    warn: "bg-amber-50 text-amber-900 ring-amber-100",
    alarm: "bg-red-50 text-red-900 ring-red-100",
  }[ton];
  return (
    <div className={`rounded-2xl p-4 text-center ring-1 ${farben}`}>
      <div className="text-3xl font-bold">{zahl}</div>
      <div className="mt-1 text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

export function ElternDashboard({ data }: { data: ElternData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Überblick</h1>
        <p className="text-sm text-slate-500">
          Ein grober Stand – kein Kontrollblick. 💙
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          zahl={data.offeneAufgaben}
          label="Offene Aufgaben"
          ton={data.offeneAufgaben > 0 ? "warn" : "neutral"}
        />
        <StatCard
          zahl={data.hilfebedarf.length}
          label="Hilfe gewünscht"
          ton={data.hilfebedarf.length > 0 ? "alarm" : "neutral"}
        />
        <StatCard zahl={data.kommendeArbeiten.length} label="Arbeiten" />
      </div>

      {/* Hilfebedarf – das wichtigste Signal für Eltern */}
      <section>
        <h2 className="section-title">🙋 Wobei Hilfe gewünscht ist</h2>
        {data.hilfebedarf.length === 0 ? (
          <EmptyState emoji="🙂" text="Aktuell ist keine Hilfe angefragt." />
        ) : (
          <div className="space-y-2">
            {data.hilfebedarf.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-100"
              >
                <FachBadge name={h.fach.name} farbe={h.fach.farbe} />
                <span className="text-sm">{h.titel}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rote Themen */}
      <section>
        <h2 className="section-title">🔴 Schwierige Themen</h2>
        {data.roteThemen.length === 0 ? (
          <EmptyState emoji="👍" text="Keine als unklar markierten Themen." />
        ) : (
          <div className="space-y-2">
            {data.roteThemen.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: t.fach.farbe }}
                />
                <span className="text-sm">{t.thema}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {t.fach.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Anstehende Arbeiten */}
      {data.kommendeArbeiten.length > 0 && (
        <section>
          <h2 className="section-title">🎯 Anstehende Klassenarbeiten</h2>
          <div className="space-y-2">
            {data.kommendeArbeiten.map((ka) => (
              <div
                key={ka.id}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100"
              >
                <FachBadge name={ka.fach.name} farbe={ka.fach.farbe} />
                <span className="text-xs font-medium text-slate-500">
                  {faelligkeitLabel(ka.datum)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
