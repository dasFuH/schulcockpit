import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { logoutAction } from "@/app/actions/auth";

/**
 * Layout für alle eingeloggten Seiten.
 * - erzwingt eine Session (sonst Redirect zum Login)
 * - rendert Kopfzeile + untere Navigation (mobile-first)
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎒</span>
          <span className="font-semibold">Schul-Cockpit</span>
          {session.role === "PARENT" && (
            <span className="chip bg-slate-200 text-slate-600">Eltern</span>
          )}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            Abmelden
          </button>
        </form>
      </header>

      {/* Platz unten für die fixe Navigationsleiste */}
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <BottomNav role={session.role} />
    </div>
  );
}
