import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PasswordResetRequestForm } from "./PasswordResetRequestForm";

export const metadata = { title: "Passwort vergessen · Schul-Cockpit" };

export default async function PasswordForgottenPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-3xl">
            🎒
          </div>
          <h1 className="text-2xl font-bold">Passwort vergessen?</h1>
          <p className="mt-1 text-sm text-slate-500">
            Wir senden dir einen Link zum Zurücksetzen deines Passworts.
          </p>
        </div>

        <PasswordResetRequestForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand">
            Zurück zur Anmeldung
          </Link>
        </p>
      </div>
    </main>
  );
}
