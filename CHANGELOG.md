# Changelog

Alle nennenswerten Änderungen an Schul-Cockpit werden hier dokumentiert.

Dieses Projekt folgt SemVer. Die technische Versionsquelle ist `package.json`.

## [0.3.0] - 2026-07-13

### Added

- Öffentlicher Passwort-Reset per konfigurierbarem SMTP mit den Seiten
  „Passwort vergessen“ und „Passwort zurücksetzen“.
- Einmalige, nach 15 Minuten ablaufende Reset-Tokens, deren SHA-256-Hash pro
  Konto gespeichert wird.

### Changed

- Passwortwechsel widerrufen nun alle vorhandenen Sitzungen eines Kontos.
- Dokumentation und Docker-Compose enthalten die SMTP-Konfiguration für den
  Passwort-Reset.

## [0.2.0] - 2026-06-09

### Added

- Registrierung für neue Schülerkonten.
- Nutzerverwaltung für Schüler:innen mit Bearbeitung eigener Kontodaten.
- Verwaltung verknüpfter Elternkonten inklusive Anlegen, Bearbeiten und Löschen.
- Explizite Eltern-Schüler-Verknüpfung im Prisma-Datenmodell.
- Prisma-Migration `0002_user_management` für bestehende Installationen.

### Changed

- Eltern-Dashboard liest nur noch das explizit verknüpfte Schülerkonto.
- Demo-Seed verknüpft das Demo-Elternkonto mit dem Demo-Schülerkonto.

## [0.1.0] - 2026-06-07

### Added

- MVP mit Login, Fächerverwaltung, Hausaufgaben, Tagesnotizen, Klassenarbeiten, Dashboard, Wochencheck und geschützten Uploads.
