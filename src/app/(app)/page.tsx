import Link from "next/link";
import { requireSession } from "@/lib/auth";
import {
  getDashboardData,
  getElternUebersicht,
  getSchuelerUserId,
} from "@/lib/queries";
import { FachBadge, AmpelChip, EmptyState, SectionTitle } from "@/components/ui";
import { faelligkeitLabel } from "@/lib/dates";
import { ElternDashboard } from "./ElternDashboard";

export const metadata = { title: "Heute · Schul-Cockpit" };

/** Kleine Hausaufgaben-Zeile fürs Dashboard. */
function HaZeile({
  titel,
  fach,
  farbe,
  datum,
  alarm = false,
}: {
  titel: string;
  fach: string;
  farbe: string;
  datum: Date;
  alarm?: boolean;
}) {
  return (
    <Link
      href="/hausaufgaben"
      className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100 active:bg-slate-50"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: farbe }}
        />
        <span className="truncate text-sm font-medium">{titel}</span>
        <span className="shrink-0 text-xs text-slate-400">{fach}</span>
      </div>
      <span
        className={`shrink-0 text-xs ${alarm ? "font-semibold text-red-600" : "text-slate-400"}`}
      >
        {faelligkeitLabel(datum)}
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();

  // Elternansicht: bewusst reduzierter Überblick
  if (session.role === "PARENT") {
    const schuelerId = await getSchuelerUserId();
    if (!schuelerId) {
      return (
        <EmptyState emoji="👋" text="Noch kein Schülerkonto vorhanden." />
      );
    }
    const data = await getElternUebersicht(schuelerId);
    return <ElternDashboard data={data} />;
  }

  // Schüleransicht
  const d = await getDashboardData(session.userId);
  const heuteGesamt = d.heuteFaellig.length + d.ueberfaellig.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi {session.name} 👋</h1>
        <p className="text-sm text-slate-500">
          {heuteGesamt === 0
            ? "Heute ist nichts dringend fällig. Schön!"
            : `Du hast ${heuteGesamt} Sache${heuteGesamt === 1 ? "" : "n"} im Blick.`}
        </p>
      </div>

      {/* Überfällig – ganz oben, wenn vorhanden */}
      {d.ueberfaellig.length > 0 && (
        <section className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-100">
          <SectionTitle count={d.ueberfaellig.length}>
            <span className="text-red-600">⚠️ Überfällig</span>
          </SectionTitle>
          <div className="space-y-2">
            {d.ueberfaellig.map((ha) => (
              <HaZeile
                key={ha.id}
                titel={ha.titel}
                fach={ha.fach.name}
                farbe={ha.fach.farbe}
                datum={ha.abgabedatum}
                alarm
              />
            ))}
          </div>
        </section>
      )}

      {/* Heute */}
      <section>
        <SectionTitle count={d.heuteFaellig.length}>🌞 Heute fällig</SectionTitle>
        {d.heuteFaellig.length === 0 ? (
          <EmptyState emoji="✅" text="Heute nichts mehr offen." />
        ) : (
          <div className="space-y-2">
            {d.heuteFaellig.map((ha) => (
              <HaZeile
                key={ha.id}
                titel={ha.titel}
                fach={ha.fach.name}
                farbe={ha.fach.farbe}
                datum={ha.abgabedatum}
              />
            ))}
          </div>
        )}
      </section>

      {/* Morgen */}
      {d.morgenFaellig.length > 0 && (
        <section>
          <SectionTitle count={d.morgenFaellig.length}>
            🌅 Morgen fällig
          </SectionTitle>
          <div className="space-y-2">
            {d.morgenFaellig.map((ha) => (
              <HaZeile
                key={ha.id}
                titel={ha.titel}
                fach={ha.fach.name}
                farbe={ha.fach.farbe}
                datum={ha.abgabedatum}
              />
            ))}
          </div>
        </section>
      )}

      {/* Diese Woche */}
      {d.dieseWocheFaellig.length > 0 && (
        <section>
          <SectionTitle count={d.dieseWocheFaellig.length}>
            📆 Diese Woche
          </SectionTitle>
          <div className="space-y-2">
            {d.dieseWocheFaellig.map((ha) => (
              <HaZeile
                key={ha.id}
                titel={ha.titel}
                fach={ha.fach.name}
                farbe={ha.fach.farbe}
                datum={ha.abgabedatum}
              />
            ))}
          </div>
        </section>
      )}

      {/* Klassenarbeiten */}
      {d.kommendeArbeiten.length > 0 && (
        <section>
          <SectionTitle count={d.kommendeArbeiten.length}>
            🎯 Klassenarbeiten
          </SectionTitle>
          <div className="space-y-2">
            {d.kommendeArbeiten.map((ka) => (
              <Link
                key={ka.id}
                href="/klassenarbeiten"
                className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100 active:bg-slate-50"
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

      {/* Unklare Themen (gelb/rot) */}
      {d.gelbRoteThemen.length > 0 && (
        <section>
          <SectionTitle count={d.gelbRoteThemen.length}>
            🧩 Themen zum Wiederholen
          </SectionTitle>
          <div className="space-y-2">
            {d.gelbRoteThemen.slice(0, 6).map((t) => (
              <Link
                key={t.id}
                href="/notizen"
                className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100 active:bg-slate-50"
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

      <div className="pt-2 text-center">
        <Link
          href="/faecher"
          className="text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          ⚙️ Fächer verwalten
        </Link>
      </div>
    </div>
  );
}
