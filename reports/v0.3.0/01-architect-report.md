# Architekturbrief: Passwort-Reset

- Ergänze einen öffentlichen, rollenunabhängigen E-Mail-Reset-Flow über `/passwort-vergessen` und `/passwort-zuruecksetzen`; der Login verlinkt auf den Einstieg.
- Speichere pro Nutzerkonto nur einen SHA-256-Hash des zufälligen Einmal-Tokens, seine Ablaufzeit und den letzten Anfragezeitpunkt. Der Token ist 15 Minuten gültig und wird beim Zurücksetzen atomar verbraucht.
- Nutze konfigurierbares SMTP (`SMTP_URL`, `MAIL_FROM`) für den Zustellweg. Ohne vollständige Konfiguration wird der Versand für alle Anfragen gleich behandelt; Roh-Tokens erscheinen weder in Logs noch in Antworten.
- Ergänze eine `sessionVersion` im Nutzerkonto und im JWT. Jeder Passwortwechsel erhöht sie, sodass Reset und bestehende Passwortänderungen alle alten Sitzungen widerrufen.
- Die Änderung ist additiv und als Minor-Release `0.3.0` zu dokumentieren; validiert werden Prisma-Generierung, Produktions-Build und die betroffenen Browser-Flows.
