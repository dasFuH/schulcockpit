import { redirect } from "next/navigation";
import { requireSession, canWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFaecher } from "@/lib/queries";
import { Sheet } from "@/components/Sheet";
import { KlassenarbeitForm } from "@/components/forms/KlassenarbeitForm";
import { DeleteButton, QuickAction } from "@/components/RowActions";
import { FachBadge, AmpelChip, EmptyState } from "@/components/ui";
import {
  deleteKlassenarbeit,
  setKlassenarbeitLernstatus,
} from "@/app/actions/klassenarbeiten";
import { faelligkeitLabel, tageBis } from "@/lib/dates";

export const metadata = { title: "Klassenarbeiten · Schul-Cockpit" };

export default async function KlassenarbeitenPage() {
  const session = await requireSession();
  if (!canWrite(session.role)) redirect("/");

  const [faecher, arbeiten] = await Promise.all([
    getFaecher(session.userId),
    prisma.klassenarbeit.findMany({
      where: { userId: session.userId },
      include: { fach: true, anhaenge: true },
      orderBy: { datum: "asc" },
    }),
  ]);

  const now = Date.now();
  const kommend = arbeiten.filter((a) => a.datum.getTime() >= now - 86400000);
  const vergangen = arbeiten.filter((a) => a.datum.getTime() < now - 86400000);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Klassenarbeiten</h1>

      {faecher.length === 0 ? (
        <EmptyState emoji="📚" text="Lege zuerst ein Fach an." />
      ) : kommend.length === 0 ? (
        <EmptyState
          emoji="🎯"
          text="Keine anstehenden Arbeiten eingetragen. Trag sie früh ein, dann bleibt mehr Zeit zum Lernen."
        />
      ) : (
        <div className="space-y-3">
          {kommend.map((ka) => {
            const tage = tageBis(ka.datum);
            const themen = (ka.themen ?? "")
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean);
            return (
              <article key={ka.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <FachBadge name={ka.fach.name} farbe={ka.fach.farbe} />
                    <h3 className="mt-1 font-semibold leading-tight">
                      {ka.titel}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Sheet trigger="✏️" title="Arbeit bearbeiten">
                      <KlassenarbeitForm
                        faecher={faecher}
                        initial={{
                          id: ka.id,
                          fachId: ka.fachId,
                          datum: ka.datum,
                          titel: ka.titel,
                          themen: ka.themen,
                          materialien: ka.materialien,
                          lernstatus: ka.lernstatus,
                          notiz: ka.notiz,
                        }}
                      />
                    </Sheet>
                    <DeleteButton action={deleteKlassenarbeit.bind(null, ka.id)} />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`chip ${
                      tage <= 3
                        ? "bg-red-100 text-red-700"
                        : tage <= 7
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    📅 {faelligkeitLabel(ka.datum)}
                  </span>
                  <AmpelChip status={ka.lernstatus} />
                  {ka.anhaenge.length > 0 && (
                    <span className="chip bg-slate-100 text-slate-600">
                      📎 {ka.anhaenge.length}
                    </span>
                  )}
                </div>

                {themen.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {themen.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <span className="text-slate-300">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                )}

                {ka.materialien && (
                  <p className="mt-2 text-xs text-slate-400">
                    📂 {ka.materialien}
                  </p>
                )}

                {/* Lernstatus schnell setzen */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Lernstand:</span>
                  <QuickAction
                    action={setKlassenarbeitLernstatus.bind(null, ka.id, "ROT")}
                    active={ka.lernstatus === "ROT"}
                  >
                    🔴
                  </QuickAction>
                  <QuickAction
                    action={setKlassenarbeitLernstatus.bind(null, ka.id, "GELB")}
                    active={ka.lernstatus === "GELB"}
                  >
                    🟡
                  </QuickAction>
                  <QuickAction
                    action={setKlassenarbeitLernstatus.bind(null, ka.id, "GRUEN")}
                    active={ka.lernstatus === "GRUEN"}
                  >
                    🟢
                  </QuickAction>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {vergangen.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-medium text-slate-500">
            Vergangene Arbeiten ({vergangen.length}) ▾
          </summary>
          <div className="mt-3 space-y-2">
            {vergangen.map((ka) => (
              <div
                key={ka.id}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-100"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ka.fach.farbe }}
                  />
                  {ka.titel}
                  <span className="text-xs text-slate-300">
                    {ka.datum.toLocaleDateString("de-DE")}
                  </span>
                </div>
                <DeleteButton action={deleteKlassenarbeit.bind(null, ka.id)} />
              </div>
            ))}
          </div>
        </details>
      )}

      {faecher.length > 0 && (
        <Sheet trigger="+" title="Neue Klassenarbeit" fab>
          <KlassenarbeitForm faecher={faecher} />
        </Sheet>
      )}
    </div>
  );
}
