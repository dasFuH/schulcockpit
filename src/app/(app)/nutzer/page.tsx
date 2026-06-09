import { redirect } from "next/navigation";
import Link from "next/link";
import { canWrite, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sheet } from "@/components/Sheet";
import { DeleteButton } from "@/components/RowActions";
import { EmptyState } from "@/components/ui";
import { OwnAccountForm, ParentUserForm } from "@/components/forms/UserForms";
import { deleteParentUser } from "@/app/actions/users";

export const metadata = { title: "Nutzer · Schul-Cockpit" };

export default async function NutzerPage() {
  const session = await requireSession();
  if (!canWrite(session.role)) redirect("/");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    include: {
      parentAccounts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-slate-400">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Nutzer</h1>
      </div>

      <section className="space-y-2">
        <h2 className="section-title">Schülerkonto</h2>
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
          <div className="min-w-0">
            <div className="font-medium">{user.name}</div>
            <div className="truncate text-xs text-slate-400">{user.email}</div>
          </div>
          <Sheet trigger="Bearbeiten" title="Schülerkonto bearbeiten">
            <OwnAccountForm
              initial={{ id: user.id, name: user.name, email: user.email }}
            />
          </Sheet>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="section-title">Elternkonten</h2>
        {user.parentAccounts.length === 0 ? (
          <EmptyState
            emoji="👋"
            text="Noch kein Elternkonto angelegt."
          />
        ) : (
          <div className="space-y-2">
            {user.parentAccounts.map((parent) => (
              <div
                key={parent.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100"
              >
                <div className="min-w-0">
                  <div className="font-medium">{parent.name}</div>
                  <div className="truncate text-xs text-slate-400">
                    {parent.email}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sheet trigger="✏️" title="Elternkonto bearbeiten">
                    <ParentUserForm
                      initial={{
                        id: parent.id,
                        name: parent.name,
                        email: parent.email,
                      }}
                    />
                  </Sheet>
                  <DeleteButton
                    action={deleteParentUser.bind(null, parent.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Sheet trigger="+ Elternkonto" title="Neues Elternkonto">
        <ParentUserForm />
      </Sheet>
    </div>
  );
}
