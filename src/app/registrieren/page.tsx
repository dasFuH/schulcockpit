import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Registrieren · Schul-Cockpit" };

export default async function RegisterPage() {
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
            Neues Schülerkonto anlegen
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          Schon ein Konto?{" "}
          <Link href="/login" className="font-medium text-brand">
            Anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}
