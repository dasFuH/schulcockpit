import { redirect } from "next/navigation";
import Link from "next/link";
import { requireSession, canWrite } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sheet } from "@/components/Sheet";
import { FachForm } from "@/components/forms/FachForm";
import { DeleteButton } from "@/components/RowActions";
import { EmptyState } from "@/components/ui";
import { deleteFach } from "@/app/actions/faecher";

export const metadata = { title: "Fächer · Schul-Cockpit" };

export default async function FaecherPage() {
  const session = await requireSession();
  if (!canWrite(session.role)) redirect("/");

  const faecher = await prisma.fach.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { hausaufgaben: true, klassenarbeiten: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-slate-400">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Fächer</h1>
      </div>

      {faecher.length === 0 ? (
        <EmptyState
          emoji="📚"
          text="Noch keine Fächer. Lege deine Fächer an, um loszulegen."
        />
      ) : (
        <div className="space-y-2">
          {faecher.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: f.farbe }}
                />
                <div>
                  <div className="font-medium">{f.name}</div>
                  {f.lehrer && (
                    <div className="text-xs text-slate-400">{f.lehrer}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sheet trigger="✏️" title="Fach bearbeiten">
                  <FachForm
                    initial={{
                      id: f.id,
                      name: f.name,
                      farbe: f.farbe,
                      lehrer: f.lehrer,
                    }}
                  />
                </Sheet>
                <DeleteButton action={deleteFach.bind(null, f.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet trigger="+ Fach hinzufügen" title="Neues Fach">
        <FachForm />
      </Sheet>
    </div>
  );
}
