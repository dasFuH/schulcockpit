import "server-only";
import nodemailer from "nodemailer";

interface MailConfig {
  smtpUrl: string;
  mailFrom: string;
  appUrl: URL;
}

function getMailConfig(): MailConfig | null {
  const smtpUrl = process.env.SMTP_URL?.trim();
  const mailFrom = process.env.MAIL_FROM?.trim();
  const appUrlValue = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!smtpUrl || !mailFrom || !appUrlValue || /[\r\n]/.test(mailFrom)) {
    return null;
  }

  try {
    const parsedSmtpUrl = new URL(smtpUrl);
    if (
      !["smtp:", "smtps:"].includes(parsedSmtpUrl.protocol) ||
      !parsedSmtpUrl.hostname
    ) {
      return null;
    }

    const appUrl = new URL(appUrlValue);
    if (
      !["http:", "https:"].includes(appUrl.protocol) ||
      !appUrl.hostname ||
      appUrl.username ||
      appUrl.password ||
      appUrl.pathname !== "/" ||
      appUrl.search ||
      appUrl.hash
    ) {
      return null;
    }

    return { smtpUrl, mailFrom, appUrl };
  } catch {
    return null;
  }
}

/** True nur bei einer vollständig und sicher konfigurierten SMTP-Zustellung. */
export function isMailConfigured(): boolean {
  return getMailConfig() !== null;
}

/** Sendet einen Reset-Link. Der Transport wird erst für den Versand erzeugt. */
export async function sendPasswordResetEmail({
  to,
  token,
}: {
  to: string;
  token: string;
}): Promise<void> {
  const config = getMailConfig();
  if (!config) throw new Error("MAIL_NOT_CONFIGURED");

  const resetUrl = new URL("/passwort-zuruecksetzen", config.appUrl);
  resetUrl.searchParams.set("token", token);

  const transporter = nodemailer.createTransport(config.smtpUrl);
  await transporter.sendMail({
    from: config.mailFrom,
    to,
    subject: "Passwort für Schul-Cockpit zurücksetzen",
    text: [
      "Du hast angefordert, dein Passwort für Schul-Cockpit zurückzusetzen.",
      "",
      "Öffne innerhalb von 15 Minuten diesen Link:",
      resetUrl.toString(),
      "",
      "Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.",
    ].join("\n"),
  });
}
