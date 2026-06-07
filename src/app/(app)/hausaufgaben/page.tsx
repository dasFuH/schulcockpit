import { redirect } from "next/navigation";
import { requireSession, canWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFaecher } from "@/lib/queries";
import { Sheet } from "@/components/Sheet";
import { HausaufgabeForm } from "@/components/forms/HausaufgabeForm";
import { DeleteButton, QuickAction } from "@/components/RowActions";
import { FachBadge, EmptyState } from "@/components/ui";
import {
  deleteHausaufgabe,
  setHausaufgabeStatus,
} from "@/app/actions/hausaufgaben";
import { homeworkStatusFarbe, homeworkStatusLabel } from "@/lib/labels";
import { faelligkeitLabel, istUeberfaellig } from "@/lib/dates";

export const metadata = { title: "Hausaufgaben · Schul-Cockpit" };

export default async function HausaufgabenPage() {
  const session = await requireSession();
  if (!canWrite(session.role)) redirect("/");

  const [faecher, aufgaben] = await Promise.all([
    getFaecher(session.userId),
    prisma.hausaufgabe.findMany({
      where: { userId: session.userId },
      include: { fach: true, anhaenge: true },
      orderBy: [{ status: "asc" }, { abgabedatum: "asc" }],
    }),
  ]);

  const offen = aufgaben.filter((a) => a.status !== "ERLEDIGT");
  const erledigt = aufgaben.filter((a) => a.status === "ERLEDIGT");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hausaufgaben</h1>
      </div>

      {faecher.length === 0 ? (
        <EmptyState
          emoji="📚"
          text="Lege zuerst ein Fach an, dann kannst du Hausaufgaben erfassen."
        />
      ) : (
        <>
          <div className="space-y-3">
            {offen.length === 0 ? (
              <EmptyState emoji="🎉" text="Keine offenen Hausaufgaben. Stark!" />
            ) : (
              offen.map((ha) => (
                <article key={ha.id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <FachBadge name={ha.fach.name} farbe={ha.fach.farbe} />
                      <h3 className="mt-1 font-semibold leading-tight">
                        {ha.titel}
                      </h3>
                      {ha.beschreibung && (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {ha.beschreibung}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Sheet trigger="✏️" title="Hausaufgabe bearbeiten">
                        {(close) => (
                          <HausaufgabeForm
                            faecher={faecher}
                            initial={{
                              id: ha.id,
                              fachId: ha.fachId,
                              titel: ha.titel,
                              beschreibung: ha.beschreibung,
                              abgabedatum: ha.abgabedatum,
                              aufwandMinuten: ha.aufwandMinuten,
                              status: ha.status,
                              hilfeNoetig: ha.hilfeNoetig,
                            }}
                            onDone={close}
                          />
                        )}
                      </Sheet>
                      <DeleteButton action={deleteHausaufgabe.bind(null, ha.id)} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`chip ${
                        istUeberfaellig(ha.abgabedatum)
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      📅 {faelligkeitLabel(ha.abgabedatum)}
                    </span>
                    {ha.aufwandMinuten ? (
                      <span className="chip bg-slate-100 text-slate-600">
                        ⏱ {ha.aufwandMinuten} Min
                      </span>
                    ) : null}
                    {ha.hilfeNoetig && (
                      <span className="chip bg-amber-100 text-amber-800">
                        🙋 Hilfe
                      </span>
                    )}
                    {ha.anhaenge.length > 0 && (
                      <span className="chip bg-slate-100 text-slate-600">
                        📎 {ha.anhaenge.length}
                      </span>
                    )}
                  </div>

                  {/* Status-Schnellauswahl */}
                  <div className="mt-3 flex items-center gap-2">
                    <QuickAction
                      action={setHausaufgabeStatus.bind(null, ha.id, "OFFEN")}
                      active={ha.status === "OFFEN"}
                    >
                      Offen
                    </QuickAction>
                    <QuickAction
                      action={setHausaufgabeStatus.bind(null, ha.id, "ANGEFANGEN")}
                      active={ha.status === "ANGEFANGEN"}
                    >
                      Angefangen
                    </QuickAction>
                    <QuickAction
                      action={setHausaufgabeStatus.bind(null, ha.id, "ERLEDIGT")}
                      active={false}
                    >
                      ✓ Fertig
                    </QuickAction>
                  </div>
                </article>
              ))
            )}
          </div>

          {erledigt.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-500">
                Erledigt ({erledigt.length}) ▾
              </summary>
              <div className="mt-3 space-y-2">
                {erledigt.map((ha) => (
                  <div
                    key={ha.id}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-400 line-through">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ha.fach.farbe }}
                      />
                      {ha.titel}
                    </div>
                    <div className="flex items-center gap-2">
                      <QuickAction
                        action={setHausaufgabeStatus.bind(null, ha.id, "OFFEN")}
                      >
                        ↺
                      </QuickAction>
                      <DeleteButton
                        action={deleteHausaufgabe.bind(null, ha.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {faecher.length > 0 && (
        <Sheet trigger="+" title="Neue Hausaufgabe" fab>
          {(close) => <HausaufgabeForm faecher={faecher} onDone={close} />}
        </Sheet>
      )}
    </div>
  );
}
