import { redirect } from "next/navigation";
import { requireSession, canWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFaecher } from "@/lib/queries";
import { Sheet } from "@/components/Sheet";
import { TagesnotizForm } from "@/components/forms/TagesnotizForm";
import { DeleteButton } from "@/components/RowActions";
import { FachBadge, AmpelChip, EmptyState } from "@/components/ui";
import { deleteTagesnotiz } from "@/app/actions/notizen";
import { formatDatum } from "@/lib/dates";

export const metadata = { title: "Tagesnotizen · Schul-Cockpit" };

export default async function NotizenPage() {
  const session = await requireSession();
  if (!canWrite(session.role)) redirect("/");

  const [faecher, notizen] = await Promise.all([
    getFaecher(session.userId),
    prisma.tagesnotiz.findMany({
      where: { userId: session.userId },
      include: { fach: true, anhaenge: true },
      orderBy: { datum: "desc" },
      take: 60,
    }),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Tagesnotizen</h1>
      <p className="-mt-3 text-sm text-slate-500">
        Was lief heute im Unterricht? Kurz festhalten, wie gut du es verstanden
        hast.
      </p>

      {faecher.length === 0 ? (
        <EmptyState emoji="📚" text="Lege zuerst ein Fach an." />
      ) : notizen.length === 0 ? (
        <EmptyState
          emoji="📒"
          text="Noch keine Notizen. Halte nach jeder Stunde kurz fest, was dran war."
        />
      ) : (
        <div className="space-y-3">
          {notizen.map((n) => (
            <article key={n.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FachBadge name={n.fach.name} farbe={n.fach.farbe} />
                    <span className="text-xs text-slate-400">
                      {formatDatum(n.datum)}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold leading-tight">{n.thema}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Sheet trigger="✏️" title="Notiz bearbeiten">
                    <TagesnotizForm
                      faecher={faecher}
                      initial={{
                        id: n.id,
                        fachId: n.fachId,
                        datum: n.datum,
                        thema: n.thema,
                        zusammenfassung: n.zusammenfassung,
                        verstandenStatus: n.verstandenStatus,
                        unklarheiten: n.unklarheiten,
                        klassenarbeitRelevant: n.klassenarbeitRelevant,
                      }}
                    />
                  </Sheet>
                  <DeleteButton action={deleteTagesnotiz.bind(null, n.id)} />
                </div>
              </div>

              {n.zusammenfassung && (
                <p className="mt-2 text-sm text-slate-600">{n.zusammenfassung}</p>
              )}
              {n.unklarheiten && (
                <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  ❓ {n.unklarheiten}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AmpelChip status={n.verstandenStatus} />
                {n.klassenarbeitRelevant && (
                  <span className="chip bg-indigo-100 text-indigo-700">
                    🎯 KA-relevant
                  </span>
                )}
                {n.anhaenge.length > 0 && (
                  <span className="chip bg-slate-100 text-slate-600">
                    📎 {n.anhaenge.length}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {faecher.length > 0 && (
        <Sheet trigger="+" title="Neue Tagesnotiz" fab>
          <TagesnotizForm faecher={faecher} />
        </Sheet>
      )}
    </div>
  );
}
