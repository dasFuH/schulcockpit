# Release-Regel

Schul-Cockpit verwendet SemVer (`MAJOR.MINOR.PATCH`).

## Versionsquelle

- `package.json` ist die technische Quelle der aktuellen Version.
- `package-lock.json` muss dieselbe Root-Version enthalten.
- `CHANGELOG.md` dokumentiert veröffentlichte Versionen.
- Es gibt keine separate `VERSION`-Datei, damit keine zweite Quelle gepflegt werden muss.

## Einstufung

- `major`: inkompatible Datenbank-, API-, Deployment- oder Nutzungsvertragsänderung.
- `minor`: neue Funktion oder neues Nutzerverhalten ohne absichtlichen Bruch bestehender Workflows.
- `patch`: Bugfix, kleine UX-Korrektur, Dokumentations- oder Validierungsfix ohne neue Funktion.
- `none`: rein interne Prüfung ohne Dateiänderung oder nicht releaserelevante lokale Artefakte.

## Ablauf

1. Änderung einstufen: `major`, `minor`, `patch` oder `none`.
2. Version in `package.json` und `package-lock.json` konsistent setzen.
3. Release-Eintrag in `CHANGELOG.md` mit Datum `YYYY-MM-DD` ergänzen.
4. Passende Checks ausführen, mindestens `npm run build` bei App-, Prisma- oder TypeScript-Änderungen.
5. Commit- oder PR-Titel im Conventional-Commit-Stil formulieren, z. B. `feat: add user registration and management`.
