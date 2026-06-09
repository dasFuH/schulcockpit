import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden · Schul-Cockpit" };

export default async function LoginPage() {
  // Wer schon eingeloggt ist, geht direkt zum Dashboard.
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-3xl">
            🎒
          </div>
          <h1 className="text-2xl font-bold">Schul-Cockpit</h1>
          <p className="mt-1 text-sm text-slate-500">
            Dein Überblick für den Schulalltag
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="font-medium text-brand">
            Registrieren
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo: schuelerin@cockpit.local / schueler123
        </p>
      </div>
    </main>
  );
}
