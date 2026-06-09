# Changelog

Alle nennenswerten Änderungen an Schul-Cockpit werden hier dokumentiert.

Dieses Projekt folgt SemVer. Die technische Versionsquelle ist `package.json`.

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
