import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, hashPasswordResetToken } from "@/lib/auth";
import { passwordResetTokenSchema } from "@/lib/validation";
import { PasswordResetForm } from "./PasswordResetForm";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen · Schul-Cockpit",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

interface PasswordResetPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function PasswordResetPage({
  searchParams,
}: PasswordResetPageProps) {
  const session = await getSession();
  if (session) redirect("/");

  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const tokenResult = passwordResetTokenSchema.safeParse(token);
  let validLink = false;

  if (tokenResult.success) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetTokenHash: hashPasswordResetToken(tokenResult.data),
          passwordResetExpiresAt: { gt: new Date() },
        },
        select: { id: true },
      });
      validLink = Boolean(user);
    } catch {
      validLink = false;
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-3xl">
            🎒
          </div>
          <h1 className="text-2xl font-bold">Neues Passwort festlegen</h1>
          <p className="mt-1 text-sm text-slate-500">
            Wähle ein neues Passwort mit mindestens 8 Zeichen.
          </p>
        </div>

        <PasswordResetForm
          token={tokenResult.success ? tokenResult.data : ""}
          invalidLink={!validLink}
        />

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand">
            Zurück zur Anmeldung
          </Link>
        </p>
      </div>
    </main>
  );
}
